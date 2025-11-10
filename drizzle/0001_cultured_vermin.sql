CREATE TABLE `bots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bots_id` PRIMARY KEY(`id`),
	CONSTRAINT `bots_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forex_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountName` varchar(64) NOT NULL,
	`ownerName` varchar(128),
	`accountBalance` varchar(32) DEFAULT '0.00',
	`accountLogin` varchar(128) NOT NULL,
	`investorPassword` varchar(256),
	`masterPassword` varchar(256),
	`platformType` enum('meta4','meta5') NOT NULL,
	`accountType` enum('usd','cent') NOT NULL,
	`platformNameServer` varchar(256),
	`botRunning` varchar(256),
	`linkedUserEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forex_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `forex_accounts_accountName_unique` UNIQUE(`accountName`),
	CONSTRAINT `forex_accounts_accountLogin_unique` UNIQUE(`accountLogin`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `servers_id` PRIMARY KEY(`id`),
	CONSTRAINT `servers_name_unique` UNIQUE(`name`)
);
