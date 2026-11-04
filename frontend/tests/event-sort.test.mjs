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
