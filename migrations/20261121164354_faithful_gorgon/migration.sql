ALTER TABLE `players` ADD `season` integer NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS `leaderboards_leagueId_idx`;--> statement-breakpoint
DROP TABLE `leaderboards`;