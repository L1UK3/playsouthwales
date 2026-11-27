ALTER TABLE `sets` ADD `format` text DEFAULT 'Standard' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`releaseDate` text NOT NULL,
	`legalDate` text NOT NULL,
	`format` text DEFAULT 'Standard' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_sets`(`id`, `code`, `name`, `releaseDate`, `legalDate`) SELECT `id`, `code`, `name`, `releaseDate`, `legalDate` FROM `sets`;--> statement-breakpoint
DROP TABLE `sets`;--> statement-breakpoint
ALTER TABLE `__new_sets` RENAME TO `sets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `sets_releaseDate_idx` ON `sets` (`releaseDate`);--> statement-breakpoint
CREATE INDEX `sets_legalDate_idx` ON `sets` (`legalDate`);--> statement-breakpoint
CREATE INDEX `regs_date_idx` ON `regs` (`date`);