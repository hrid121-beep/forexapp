CREATE TABLE `custom_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` int NOT NULL,
	`fieldName` varchar(128) NOT NULL,
	`fieldType` enum('text','number','boolean','date') NOT NULL,
	`fieldValue` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schema_modifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modificationType` enum('add_column','add_table','modify_column','drop_column') NOT NULL,
	`tableName` varchar(128) NOT NULL,
	`columnName` varchar(128),
	`sqlQuery` text NOT NULL,
	`description` text,
	`status` enum('pending','approved','executed','failed') NOT NULL DEFAULT 'pending',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`executedAt` timestamp,
	`errorMessage` text,
	CONSTRAINT `schema_modifications_id` PRIMARY KEY(`id`)
);
