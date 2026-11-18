CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`leagueId` integer NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`startTime` text,
	`eventType` text NOT NULL,
	`game` text NOT NULL,
	`ticketLink` text,
	`description` text,
	`prizes` text,
	`entryFee` text,
	`isRecurring` integer DEFAULT false NOT NULL,
	`excludedDates` text DEFAULT '[]' NOT NULL,
	CONSTRAINT `fk_events_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`leagueId` integer NOT NULL,
	`data` text DEFAULT '[]' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT `fk_leaderboards_leagueId_leagues_id_fk` FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `leagues` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`logo` text,
	`website` text,
	`socialLink` text,
	`eventLink` text,
	`webLink` text,
	`brandColor` text,
	`location` text,
	`directions` text,
	`accessibility` text,
	`latitude` real,
	`longitude` real,
	`isChampionshipSeries` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`playerId` integer,
	`cp` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_leagueId_idx` ON `events` (`leagueId`);--> statement-breakpoint
CREATE INDEX `events_date_idx` ON `events` (`date`);--> statement-breakpoint
CREATE INDEX `leaderboards_leagueId_idx` ON `leaderboards` (`leagueId`);