CREATE TABLE `performance_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`balance` varchar(32) NOT NULL,
	`profitLoss` varchar(32) NOT NULL,
	`equity` varchar(32) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	CONSTRAINT `performance_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `forex_accounts` ADD `initialBalance` varchar(32) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `forex_accounts` ADD `currentBalance` varchar(32) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `forex_accounts` ADD `profitLoss` varchar(32) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `forex_accounts` ADD `equity` varchar(32) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `forex_accounts` ADD `lastPerformanceUpdate` timestamp;