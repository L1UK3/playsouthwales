CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`leagueId` integer NOT NULL,
	`data` text DEFAULT '[]' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`leagueId`) REFERENCES `leagues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leagues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`playerId` integer,
	`cp` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_name_unique` ON `players` (`name`);