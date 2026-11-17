import type { Event } from '@/types/Event';

const DEFAULT_DESCRIPTIONS: Readonly<Record<string, string>> = {
    CASUAL: 'Meet other local players, practise and enjoy friendly games at your Pokémon League.',
    STANDARD:
        'Play in a local tournament using the Standard format. Check with the organiser for entry details.',
    CHALLENGE:
        'League Challenges introduce competitive play, with Championship Points available based on your final placing.',
    CUP: 'League Cups offer a step up from League Challenges, with higher Championship Point awards.',
    'PRE-RELEASE':
        'Try cards from an upcoming Pokémon TCG expansion before its release at a Prerelease event.',
    SPECIAL:
        'Join a Pokémon Special Championship event and compete with players from the wider community.',
    REGIONAL:
        'Compete at a Pokémon Regional Championship alongside players from across the region.',
    INTERNATIONAL:
        'International Championships bring together Pokémon competitors from around the world.',
    WORLDS: 'The Pokémon World Championships bring qualified players together to compete for the world title.',
    LEGALITY:
        'This marks when the listed Pokémon TCG expansion becomes legal for tournament play.',
    RELEASE: 'This marks the release of a new Pokémon TCG expansion.',
    REGULATION:
        'This marks a change to the regulations used for competitive Pokémon play.',
};

/** Keep league copy unchanged; provide display text only when it is blank. */
export function getEventDescription(
    event: Pick<Event, 'eventType' | 'description'>
): string {
    if (event.description?.trim()) {
        return event.description;
    }

    const eventType = event.eventType.trim().toUpperCase();
    return Object.hasOwn(DEFAULT_DESCRIPTIONS, eventType)
        ? DEFAULT_DESCRIPTIONS[eventType]
        : '';
}
