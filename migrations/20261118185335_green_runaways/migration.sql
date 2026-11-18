ALTER TABLE `events` ADD `pokedataGuid` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`leagueId` integer NOT NULL,
	`pokedataGuid` text UNIQUE,
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
INSERT INTO `__new_events`(`id`, `leagueId`, `name`, `date`, `startTime`, `eventType`, `game`, `ticketLink`, `description`, `prizes`, `entryFee`, `isRecurring`, `excludedDates`) SELECT `id`, `leagueId`, `name`, `date`, `startTime`, `eventType`, `game`, `ticketLink`, `description`, `prizes`, `entryFee`, `isRecurring`, `excludedDates` FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `events_leagueId_idx` ON `events` (`leagueId`);--> statement-breakpoint
CREATE INDEX `events_date_idx` ON `events` (`date`);