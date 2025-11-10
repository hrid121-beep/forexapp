import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Forex account tracking tables
export const forexAccounts = mysqlTable("forex_accounts", {
  id: int("id").autoincrement().primaryKey(),
  accountName: varchar("accountName", { length: 64 }).notNull().unique(),
  ownerName: varchar("ownerName", { length: 128 }),
  ownerId: int("ownerId"), // User ID of the account creator/owner
  accountBalance: varchar("accountBalance", { length: 32 }).default("0.00"),
  accountLogin: varchar("accountLogin", { length: 128 }).notNull().unique(),
  investorPassword: varchar("investorPassword", { length: 256 }),
  masterPassword: varchar("masterPassword", { length: 256 }),
  platformType: mysqlEnum("platformType", ["meta4", "meta5"]).notNull(),
  accountType: mysqlEnum("accountType", ["usd", "cent"]).notNull(),
  platformNameServer: varchar("platformNameServer", { length: 256 }),
  botRunning: varchar("botRunning", { length: 256 }),
  linkedUserEmail: varchar("linkedUserEmail", { length: 320 }),
  brokerLogoUrl: varchar("brokerLogoUrl", { length: 512 }), // URL to broker logo image
  // Performance tracking fields
  initialBalance: varchar("initialBalance", { length: 32 }).default("0.00"),
  currentBalance: varchar("currentBalance", { length: 32 }).default("0.00"),
  profitLoss: varchar("profitLoss", { length: 32 }).default("0.00"),
  equity: varchar("equity", { length: 32 }).default("0.00"),
  lastPerformanceUpdate: timestamp("lastPerformanceUpdate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const servers = mysqlTable("servers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const bots = mysqlTable("bots", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const chatHistory = mysqlTable("chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Performance history - tracks account performance over time
export const performanceHistory = mysqlTable("performance_history", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(), // foreign key to forex_accounts
  balance: varchar("balance", { length: 32 }).notNull(),
  profitLoss: varchar("profitLoss", { length: 32 }).notNull(),
  equity: varchar("equity", { length: 32 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  notes: text("notes"), // Optional notes about this snapshot
});

// User-Account Access - Junction table for linking users to forex accounts
export const userAccountAccess = mysqlTable("user_account_access", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who has access
  accountId: int("accountId").notNull(), // Forex account they can access
  canEdit: mysqlEnum("canEdit", ["yes", "no"]).default("no").notNull(), // Whether user can edit or just view
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(), // Admin who granted access
});

export type ForexAccount = typeof forexAccounts.$inferSelect;
export type InsertForexAccount = typeof forexAccounts.$inferInsert;
export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = typeof bots.$inferInsert;
export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;
export type PerformanceHistory = typeof performanceHistory.$inferSelect;
export type InsertPerformanceHistory = typeof performanceHistory.$inferInsert;

// Custom fields system - allows AI to dynamically add fields to entities
export const customFields = mysqlTable("custom_fields", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 64 }).notNull(), // e.g., "forex_account", "user"
  entityId: int("entityId").notNull(), // foreign key to the entity
  fieldName: varchar("fieldName", { length: 128 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "number", "boolean", "date"]).notNull(),
  fieldValue: text("fieldValue"),
  createdBy: int("createdBy").notNull(), // admin user who created this field
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Schema modifications tracking - logs all schema changes made by AI
export const schemaModifications = mysqlTable("schema_modifications", {
  id: int("id").autoincrement().primaryKey(),
  modificationType: mysqlEnum("modificationType", ["add_column", "add_table", "modify_column", "drop_column"]).notNull(),
  tableName: varchar("tableName", { length: 128 }).notNull(),
  columnName: varchar("columnName", { length: 128 }),
  sqlQuery: text("sqlQuery").notNull(), // The actual SQL that was executed
  description: text("description"), // Human-readable description
  status: mysqlEnum("status", ["pending", "approved", "executed", "failed"]).default("pending").notNull(),
  createdBy: int("createdBy").notNull(), // admin user who approved this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  executedAt: timestamp("executedAt"),
  errorMessage: text("errorMessage"),
});

export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = typeof customFields.$inferInsert;
export type SchemaModification = typeof schemaModifications.$inferSelect;
export type InsertSchemaModification = typeof schemaModifications.$inferInsert;

// System settings - stores API keys and configuration
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(), // e.g., "grok_api_key"
  settingValue: text("settingValue"), // encrypted or plain value
  settingType: mysqlEnum("settingType", ["api_key", "config", "feature_flag"]).notNull(),
  description: text("description"), // Human-readable description
  isEncrypted: mysqlEnum("isEncrypted", ["yes", "no"]).default("no").notNull(),
  updatedBy: int("updatedBy"), // admin user who last updated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type UserAccountAccess = typeof userAccountAccess.$inferSelect;
export type InsertUserAccountAccess = typeof userAccountAccess.$inferInsert;

// Notifications table for in-app user notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who receives the notification
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 64 }), // e.g., "account", "user", "permission"
  relatedEntityId: int("relatedEntityId"), // ID of the related entity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
