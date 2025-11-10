CREATE TABLE `user_account_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int NOT NULL,
	`canEdit` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `user_account_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `forex_accounts` ADD `ownerId` int;