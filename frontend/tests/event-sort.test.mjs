import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
});
after(() => server.close());

const { eventsInScheduleOrder } = await server.ssrLoadModule(
    '/src/hooks/useSortEvents.ts'
);

test('eventsInScheduleOrder preserves API order within a day', () => {
    const events = [
        {
            id: 1,
            name: 'Legality',
            date: '2026-09-12',
            leagueId: 0,
            eventType: 'LEGALITY',
            game: 'TCG',
        },
        {
            id: 2,
            name: 'Regional',
            date: '2026-09-12',
            leagueId: 0,
            eventType: 'REGIONAL',
            game: 'TCG',
        },
        {
            id: 3,
            name: 'Casual',
            date: '2026-09-12',
            leagueId: 0,
            eventType: 'CASUAL',
            game: 'TCG',
        },
    ];
    const sorted = eventsInScheduleOrder(events);
    assert.deepEqual(
        sorted.map((event) => event.id),
        [1, 2, 3]
    );
});

test('eventsInScheduleOrder fixes merged client order on one day', () => {
    const events = [
        {
            id: 3,
            name: 'Casual',
            date: '2026-09-12',
            leagueId: 1,
            eventType: 'CASUAL',
            game: 'TCG',
        },
        {
            id: 'legality-SV10',
            name: 'Set',
            date: '2026-09-12',
            leagueId: -1,
            eventType: 'LEGALITY',
            game: 'TCG',
        },
        {
            id: 2,
            name: 'Regional',
            date: '2026-09-12',
            leagueId: 0,
            eventType: 'REGIONAL',
            game: 'TCG',
        },
    ];
    const sorted = eventsInScheduleOrder(events);
    assert.deepEqual(
        sorted.map((event) => event.id),
        ['legality-SV10', 2, 3]
    );
});

test('eventsInScheduleOrder sorts by date before type rank', () => {
    const events = [
        {
            id: 1,
            name: 'Worlds',
            date: '2026-09-13',
            leagueId: 0,
            eventType: 'WORLDS',
            game: 'TCG',
        },
        {
            id: 2,
            name: 'Casual',
            date: '2026-09-12',
            leagueId: 0,
            eventType: 'CASUAL',
            game: 'TCG',
        },
    ];
    const sorted = eventsInScheduleOrder(events);
    assert.deepEqual(
        sorted.map((event) => event.id),
        [2, 1]
    );
});

test('eventsInScheduleOrder uses start time for equal type rank', () => {
    const events = [
        {
            id: 1,
            name: 'Cup late',
            date: '2026-09-12',
            startTime: '14:00',
            leagueId: 0,
            eventType: 'CUP',
            game: 'TCG',
        },
        {
            id: 2,
            name: 'Cup early',
            date: '2026-09-12',
            startTime: '10:00',
            leagueId: 0,
            eventType: 'CUP',
            game: 'TCG',
        },
    ];
    const sorted = eventsInScheduleOrder(events);
    assert.deepEqual(
        sorted.map((event) => event.id),
        [2, 1]
    );
});
