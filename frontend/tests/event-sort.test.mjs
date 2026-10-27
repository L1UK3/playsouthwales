import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

// Use the application's Vite transforms and aliases without starting an HTTP server.
const server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
});
after(() => server.close());

const { compareEvents } = await server.ssrLoadModule(
    '/src/hooks/useSortEvents.ts'
);

const make = (id, eventType, date = '2026-09-12', startTime) => ({
    id,
    name: `Event ${id}`,
    date,
    startTime,
    leagueId: 0,
    eventType,
    game: 'TCG',
});

test('same-day events follow the event type hierarchy', () => {
    const events = [
        make(1, 'CASUAL'),
        make(2, 'STANDARD'),
        make(3, 'PRE-RELEASE'),
        make(4, 'CHALLENGE'),
        make(5, 'CUP'),
        make(6, 'REGIONAL'),
        make(7, 'LEGALITY'),
    ];
    const order = [...events].sort(compareEvents).map((e) => e.eventType);
    assert.deepEqual(order, [
        'LEGALITY',
        'REGIONAL',
        'CUP',
        'CHALLENGE',
        'PRE-RELEASE',
        'STANDARD',
        'CASUAL',
    ]);
});

test('date order takes precedence over event type', () => {
    const events = [make(1, 'WORLDS', '2026-09-13'), make(2, 'CASUAL')];
    const order = [...events].sort(compareEvents).map((e) => e.id);
    assert.deepEqual(order, [2, 1]);
});

test('events of equal rank sort by start time', () => {
    const events = [
        make(1, 'CUP', '2026-09-12', '14:00'),
        make(2, 'CUP', '2026-09-12', '10:00'),
    ];
    const order = [...events].sort(compareEvents).map((e) => e.id);
    assert.deepEqual(order, [2, 1]);
});

test('unknown event types sort after casual', () => {
    const events = [make(1, 'MYSTERY'), make(2, 'CASUAL')];
    const order = [...events].sort(compareEvents).map((e) => e.id);
    assert.deepEqual(order, [2, 1]);
});
