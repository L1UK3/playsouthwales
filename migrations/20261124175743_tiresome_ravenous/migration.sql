CREATE TABLE `regs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`releaseDate` text NOT NULL,
	`legalDate` text NOT NULL,
	`format` text DEFAULT 'Standard' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `regs_date_idx` ON `regs` (`date`);--> statement-breakpoint
CREATE INDEX `sets_releaseDate_idx` ON `sets` (`releaseDate`);--> statement-breakpoint
CREATE INDEX `sets_legalDate_idx` ON `sets` (`legalDate`);