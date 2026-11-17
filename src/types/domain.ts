export interface League {
	leagueId: number;
	name: string;
	logo?: string;
	website?: string;
	socialLink?: string;
	eventLink?: string;
	webLink?: string;
	brandColor?: string;
	location?: string;
	directions?: string;
	accessibility?: string;
	latitude?: number;
	longitude?: number;
	format?: string;
	hasStandings?: boolean;
	isChampionshipSeries?: boolean;
}

export interface ScheduleEvent {
	id: number | string;
	name: string;
	date: string;
	startTime?: string;
	leagueId: number;
	leagueName?: string;
	ticketLink?: string;
	eventType: string;
	game: string;
	description?: string;
	prizes?: string;
	entryFee?: string;
	isRecurring?: boolean;
	recurringEventId?: number;
	excludedDates?: string[];
	isExcluded?: boolean;
}

export type EventTypeMap = Record<string, string>;

export interface LeaderboardPosition {
	position: number;
	name: string;
	cp?: number;
	wins?: number;
	losses?: number;
	draws?: number;
	attendance?: number;
	points?: number;
	userId?: number;
}

export type LeagueMap = Record<number, League>;

export type EventsByDate = Record<string, ScheduleEvent[]>;
