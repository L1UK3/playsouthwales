import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

// Use the application's Vite transforms and aliases without starting an HTTP server.
const server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
});
after(() => server.close());

const { getEventDescription } = await server.ssrLoadModule(
    '/src/features/event-card/utils/getEventDescription.ts'
);
const { EVENT_TYPE_MAP } = await server.ssrLoadModule(
    '/src/constants/index.ts'
);
const { default: ListCard } = await server.ssrLoadModule(
    '/src/features/event-card/components/ListCard.tsx'
);
const { default: ScheduleCard } = await server.ssrLoadModule(
    '/src/features/event-card/components/ScheduleCard.tsx'
);

const event = {
    id: 1,
    name: 'Local event',
    date: '2026-09-12',
    leagueId: 0,
    eventType: 'CHALLENGE',
    game: 'TCG',
};

test('schedule card defaults missing fees to GBP zero with two decimals', () => {
    for (const entryFee of [undefined, null, '', '  ', '0', '5', '£5', '5.5']) {
        const markup = renderToStaticMarkup(
            createElement(ScheduleCard, {
                event: { ...event, entryFee },
                leagueMap: {},
                types: EVENT_TYPE_MAP,
            })
        );
        const expected =
            entryFee === '5.5'
                ? '£5.50'
                : entryFee === '5' || entryFee === '£5'
                  ? '£5.00'
                  : '£0.00';
        assert.ok(
            markup.includes(`>${expected}</span>`),
            `entryFee=${entryFee}`
        );
    }
});

test('list card also displays the default and formatted fees', () => {
    for (const [entryFee, expected] of [
        [undefined, '£0.00'],
        ['5.5', '£5.50'],
    ]) {
        const markup = renderToStaticMarkup(
            createElement(ListCard, {
                event: { ...event, entryFee },
                leagueMap: {},
                types: EVENT_TYPE_MAP,
                isExpanded: true,
            })
        );
        assert.ok(
            markup.includes(`${expected}</span>`),
            `entryFee=${entryFee}`
        );
    }
});

test('schedule card preserves descriptive fees rather than inventing a price', () => {
    for (const entryFee of [
        'Free',
        'TBC',
        '£5 / £10',
        '2 tickets for £10',
        '£1,000.00',
    ]) {
        const markup = renderToStaticMarkup(
            createElement(ScheduleCard, {
                event: { ...event, entryFee },
                leagueMap: {},
                types: EVENT_TYPE_MAP,
            })
        );
        assert.ok(markup.includes(`>${entryFee}</span>`), entryFee);
    }
});

test('every displayed event type has a default description', () => {
    for (const eventType of Object.keys(EVENT_TYPE_MAP)) {
        assert.ok(getEventDescription({ eventType }).trim(), eventType);
    }
});

test('absent, empty, null and whitespace-only descriptions use the default', () => {
    for (const description of [undefined, null, '', ' \n\t ']) {
        assert.match(
            getEventDescription({ ...event, description }),
            /Championship Points/
        );
    }
});

test('league copy is preserved exactly without changing the input', () => {
    const input = Object.freeze({
        ...event,
        description: '  Bring your own deck.\n',
    });
    assert.equal(getEventDescription(input), input.description);
});

test('normalizes event type whitespace and casing for default lookup', () => {
    assert.equal(
        getEventDescription({ eventType: ' challenge ' }),
        getEventDescription(event)
    );
});

test('unknown event types keep supplied copy or return no description', () => {
    for (const eventType of ['NEW-TYPE', '', 'constructor', '__proto__']) {
        assert.equal(getEventDescription({ eventType }), '');
        assert.equal(
            getEventDescription({ eventType, description: 'Local details' }),
            'Local details'
        );
    }
});

for (const [name, Card] of [
    ['list', ListCard],
    ['schedule', ScheduleCard],
]) {
    const render = (overrides = {}) =>
        renderToStaticMarkup(
            createElement(Card, {
                event: { ...event, ...overrides },
                leagueMap: {},
                types: EVENT_TYPE_MAP,
                isExpanded: true,
            })
        );

    test(`${name} card renders fallback text for a blank league description`, () => {
        assert.match(render({ description: ' \n ' }), /Championship Points/);
    });

    test(`${name} card prefers custom text and escapes it`, () => {
        const markup = render({ description: 'Bring <your> deck & sleeves.' });
        assert.ok(markup.includes('Bring &lt;your&gt; deck &amp; sleeves.'));
        assert.ok(!markup.includes('Championship Points'));
    });

    test(`${name} card uses fallback text for release and regulation events`, () => {
        for (const eventType of ['RELEASE', 'LEGALITY', 'REGULATION']) {
            assert.ok(
                render({ eventType }).includes(
                    getEventDescription({ eventType })
                )
            );
        }
    });
}
