import { eq, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    // Set role: owner gets admin, new users default to user (client), existing users keep their role
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      // Project owner always gets admin role
      values.role = 'admin';
      updateSet.role = 'admin';
    } else {
      // Default new users to 'user' role (regular client)
      values.role = 'user';
      // Don't update role on subsequent logins (only set on first insert)
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  const user = result.length > 0 ? result[0] : undefined;
  
  if (user) {
    console.log(`[Database] getUserByOpenId - openId: ${openId}, email: ${user.email}, role: ${user.role}`);
  }

  return user;
}

// Forex account queries
export async function getAllForexAccounts() {
  const db = await getDb();
  if (!db) return [];
  const { forexAccounts } = await import("../drizzle/schema");
  return db.select().from(forexAccounts);
}

export async function getForexAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { forexAccounts } = await import("../drizzle/schema");
  const result = await db.select().from(forexAccounts).where(eq(forexAccounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createForexAccount(account: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { forexAccounts } = await import("../drizzle/schema");
  const result = await db.insert(forexAccounts).values(account);
  return result;
}

export async function updateForexAccount(id: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { forexAccounts } = await import("../drizzle/schema");
  await db.update(forexAccounts).set(updates).where(eq(forexAccounts.id, id));
}

export async function deleteForexAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { forexAccounts } = await import("../drizzle/schema");
  await db.delete(forexAccounts).where(eq(forexAccounts.id, id));
}

// Server queries
export async function getAllServers() {
  const db = await getDb();
  if (!db) return [];
  const { servers } = await import("../drizzle/schema");
  return db.select().from(servers);
}

export async function createServer(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { servers } = await import("../drizzle/schema");
  const result = await db.insert(servers).values({ name });
  return result;
}

export async function deleteServer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { servers } = await import("../drizzle/schema");
  await db.delete(servers).where(eq(servers.id, id));
}

// Bot queries
export async function getAllBots() {
  const db = await getDb();
  if (!db) return [];
  const { bots } = await import("../drizzle/schema");
  return db.select().from(bots);
}

export async function createBot(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { bots } = await import("../drizzle/schema");
  const result = await db.insert(bots).values({ name });
  return result;
}

export async function deleteBot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { bots } = await import("../drizzle/schema");
  await db.delete(bots).where(eq(bots.id, id));
}

// Chat history queries
export async function getChatHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { chatHistory } = await import("../drizzle/schema");
  return db.select().from(chatHistory).where(eq(chatHistory.userId, userId));
}

export async function saveChatMessage(message: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { chatHistory } = await import("../drizzle/schema");
  await db.insert(chatHistory).values(message);
}

// User queries
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// Custom fields queries
export async function getCustomFields(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];
  const { customFields } = await import("../drizzle/schema");
  return db.select().from(customFields)
    .where(and(
      eq(customFields.entityType, entityType),
      eq(customFields.entityId, entityId)
    ));
}

export async function getAllCustomFieldsByType(entityType: string) {
  const db = await getDb();
  if (!db) return [];
  const { customFields } = await import("../drizzle/schema");
  return db.select().from(customFields)
    .where(eq(customFields.entityType, entityType));
}

export async function createCustomField(field: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { customFields } = await import("../drizzle/schema");
  const result = await db.insert(customFields).values(field);
  return result;
}

export async function updateCustomField(id: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { customFields } = await import("../drizzle/schema");
  await db.update(customFields).set(updates).where(eq(customFields.id, id));
}

export async function deleteCustomField(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { customFields } = await import("../drizzle/schema");
  await db.delete(customFields).where(eq(customFields.id, id));
}

// Schema modifications queries
export async function getAllSchemaModifications() {
  const db = await getDb();
  if (!db) return [];
  const { schemaModifications } = await import("../drizzle/schema");
  return db.select().from(schemaModifications).orderBy(schemaModifications.createdAt);
}

export async function getPendingSchemaModifications() {
  const db = await getDb();
  if (!db) return [];
  const { schemaModifications } = await import("../drizzle/schema");
  return db.select().from(schemaModifications)
    .where(eq(schemaModifications.status, "pending"));
}

export async function createSchemaModification(modification: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { schemaModifications } = await import("../drizzle/schema");
  const result = await db.insert(schemaModifications).values(modification);
  return result;
}

export async function updateSchemaModificationStatus(id: number, status: "pending" | "approved" | "executed" | "failed", errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { schemaModifications } = await import("../drizzle/schema");
  const updates: any = { status };
  if (status === "executed") {
    updates.executedAt = new Date();
  }
  if (errorMessage) {
    updates.errorMessage = errorMessage;
  }
  await db.update(schemaModifications).set(updates).where(eq(schemaModifications.id, id));
}

export async function executeSchemaModification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { schemaModifications } = await import("../drizzle/schema");
  
  // Get the modification
  const [modification] = await db.select().from(schemaModifications)
    .where(eq(schemaModifications.id, id))
    .limit(1);
  
  if (!modification) {
    throw new Error("Schema modification not found");
  }
  
  if (modification.status !== "approved") {
    throw new Error("Schema modification must be approved before execution");
  }
  
  try {
    // Execute the SQL query
    await db.execute(modification.sqlQuery);
    await updateSchemaModificationStatus(id, "executed");
    return { success: true };
  } catch (error: any) {
    await updateSchemaModificationStatus(id, "failed", error.message);
    throw error;
  }
}


// System Settings Management
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const { systemSettings } = await import("../drizzle/schema");
  const [setting] = await db.select().from(systemSettings)
    .where(eq(systemSettings.settingKey, key))
    .limit(1);
  return setting || null;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  const { systemSettings } = await import("../drizzle/schema");
  return db.select().from(systemSettings);
}

export async function setSetting(setting: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { systemSettings } = await import("../drizzle/schema");
  
  // Check if setting exists
  const existing = await getSetting(setting.settingKey);
  
  if (existing) {
    // Update existing setting
    await db.update(systemSettings)
      .set({
        settingValue: setting.settingValue,
        settingType: setting.settingType,
        description: setting.description,
        updatedBy: setting.updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(systemSettings.settingKey, setting.settingKey));
  } else {
    // Insert new setting
    await db.insert(systemSettings).values(setting);
  }
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { systemSettings } = await import("../drizzle/schema");
  await db.delete(systemSettings).where(eq(systemSettings.settingKey, key));
}


// User-Account Access queries (for linking users to forex accounts)
export async function linkAccountToUser(accountId: number, userId: number, canEdit: boolean, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { userAccountAccess } = await import("../drizzle/schema");
  
  // Check if link already exists
  const existing = await db.select().from(userAccountAccess)
    .where(and(
      eq(userAccountAccess.accountId, accountId),
      eq(userAccountAccess.userId, userId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing link
    await db.update(userAccountAccess)
      .set({ canEdit: canEdit ? "yes" : "no" })
      .where(and(
        eq(userAccountAccess.accountId, accountId),
        eq(userAccountAccess.userId, userId)
      ));
    return existing[0];
  } else {
    // Create new link
    const result = await db.insert(userAccountAccess).values({
      accountId,
      userId,
      canEdit: canEdit ? "yes" : "no",
      createdBy
    });
    return result;
  }
}

export async function unlinkAccountFromUser(accountId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { userAccountAccess } = await import("../drizzle/schema");
  
  await db.delete(userAccountAccess)
    .where(and(
      eq(userAccountAccess.accountId, accountId),
      eq(userAccountAccess.userId, userId)
    ));
}

export async function getUserLinkedAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { userAccountAccess, forexAccounts } = await import("../drizzle/schema");
  
  // Get all accounts the user owns
  const ownedAccounts = await db.select().from(forexAccounts)
    .where(eq(forexAccounts.ownerId, userId));
  
  // Get all accounts linked to the user
  const linkedAccessRecords = await db.select()
    .from(userAccountAccess)
    .where(eq(userAccountAccess.userId, userId));
  
  const linkedAccountIds = linkedAccessRecords.map(r => r.accountId);
  
  if (linkedAccountIds.length === 0) {
    return ownedAccounts;
  }
  
  const linkedAccounts = await db.select().from(forexAccounts)
    .where(inArray(forexAccounts.id, linkedAccountIds));
  
  // Combine owned and linked accounts, removing duplicates
  const allAccounts = [...ownedAccounts];
  for (const linked of linkedAccounts) {
    if (!allAccounts.find(a => a.id === linked.id)) {
      allAccounts.push(linked);
    }
  }
  
  return allAccounts;
}

export async function getAccountLinkedUsers(accountId: number) {
  const db = await getDb();
  if (!db) return [];
  const { userAccountAccess } = await import("../drizzle/schema");
  
  return db.select().from(userAccountAccess)
    .where(eq(userAccountAccess.accountId, accountId));
}

export async function getUserAccountPermission(userId: number, accountId: number) {
  const db = await getDb();
  if (!db) return null;
  const { userAccountAccess, forexAccounts } = await import("../drizzle/schema");
  
  // Check if user owns the account
  const [account] = await db.select().from(forexAccounts)
    .where(eq(forexAccounts.id, accountId))
    .limit(1);
  
  if (account && account.ownerId === userId) {
    return { canEdit: true, isOwner: true };
  }
  
  // Check if user has linked access
  const [access] = await db.select().from(userAccountAccess)
    .where(and(
      eq(userAccountAccess.accountId, accountId),
      eq(userAccountAccess.userId, userId)
    ))
    .limit(1);
  
  if (access) {
    return { canEdit: access.canEdit === "yes", isOwner: false };
  }
  
  return null;
}

// Notification queries
export async function createNotification(notification: {
  userId: number;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  relatedEntityType?: string;
  relatedEntityId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  
  const result = await db.insert(notifications).values({
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type || "info",
    relatedEntityType: notification.relatedEntityType,
    relatedEntityId: notification.relatedEntityId,
  });
  
  return result;
}

export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const { notifications } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const { notifications } = await import("../drizzle/schema");
  const { count } = await import("drizzle-orm");
  
  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, "no")
    ));
  
  return result[0]?.count || 0;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  
  await db
    .update(notifications)
    .set({ isRead: "yes" })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  
  await db
    .update(notifications)
    .set({ isRead: "yes" })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, "no")
    ));
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { notifications } = await import("../drizzle/schema");
  
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}
