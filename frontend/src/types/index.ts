export interface League {
    leagueId: number;
    name: string;
    logo?: string;
    website?: string;
    socialLink?: string;
    pokemonLink?: string;
    brandColor?: string;
    webLink?: string;
}

export interface Event {
    id: number;
    name: string;
    date: string;
    startTime?: string;
    leagueId: number;
    leagueName?: string;
    ticketLink?: string;
    type: string;
    game: string;
    description?: string;
    prizes?: string;
    entryFee?: string;
}

export type EventTypes = Record<string, string>;
