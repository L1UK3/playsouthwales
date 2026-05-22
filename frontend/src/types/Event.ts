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


