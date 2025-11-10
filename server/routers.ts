import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      console.log('[auth.me] Returning user:', JSON.stringify(opts.ctx.user));
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Forex account management
  forexAccounts: router({
    list: protectedProcedure.query(async () => {
      const { getAllForexAccounts } = await import('./db');
      return getAllForexAccounts();
    }),
    create: protectedProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { createForexAccount, getAllForexAccounts } = await import('./db');
      const { getBrokerLogoUrl } = await import('./brokerLogoService');
      const { TRPCError } = await import('@trpc/server');
      
      // Add broker logo URL and ownerId to input
      const brokerLogoUrl = getBrokerLogoUrl(input.platformNameServer);
      const accountData = {
        ...input,
        brokerLogoUrl,
        ownerId: ctx.user.id,
      };
      
      await createForexAccount(accountData);
      // Return the newly created account
      const accounts = await getAllForexAccounts();
      return accounts[accounts.length - 1];
    }),
    update: protectedProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { updateForexAccount, getForexAccountById, getUserAccountPermission } = await import('./db');
      const { TRPCError } = await import('@trpc/server');
      const { id, ...updates } = input;
      
      // Check if user has permission to edit this account
      const permission = await getUserAccountPermission(ctx.user.id, id);
      const isAdmin = ctx.user.role === 'admin';
      
      if (!isAdmin && (!permission || !permission.canEdit)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this account',
        });
      }
      
      await updateForexAccount(id, updates);
      // Return the updated account
      const updatedAccount = await getForexAccountById(id);
      return updatedAccount;
    }),
    delete: protectedProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { deleteForexAccount, getForexAccountById } = await import('./db');
      const { TRPCError } = await import('@trpc/server');
      
      // Only account owner or admin can delete
      const account = await getForexAccountById(input.id);
      const isAdmin = ctx.user.role === 'admin';
      const isOwner = account?.ownerId === ctx.user.id;
      
      if (!isAdmin && !isOwner) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this account',
        });
      }
      
      await deleteForexAccount(input.id);
      return { success: true };
    }),
  }),

  // Server management
  servers: router({
    list: protectedProcedure.query(async () => {
      const { getAllServers } = await import('./db');
      return getAllServers();
    }),
    create: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createServer } = await import('./db');
      return createServer(input.name);
    }),
    delete: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteServer } = await import('./db');
      await deleteServer(input.id);
      return { success: true };
    }),
  }),

  // Bot management
  bots: router({
    list: protectedProcedure.query(async () => {
      const { getAllBots } = await import('./db');
      return getAllBots();
    }),
    create: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createBot } = await import('./db');
      return createBot(input.name);
    }),
    delete: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteBot } = await import('./db');
      await deleteBot(input.id);
      return { success: true };
    }),
  }),

  // User management
  users: router({
    list: adminProcedure.query(async () => {
      const { getAllUsers } = await import('./db');
      return getAllUsers();
    }),
    updateRole: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateUserRole } = await import('./db');
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
  }),

  // Custom Fields Management
  customFields: router({
    getByEntity: protectedProcedure.input((val: any) => val).query(async ({ input }) => {
      const { getCustomFields } = await import('./db');
      return getCustomFields(input.entityType, input.entityId);
    }),
    getAllByType: protectedProcedure.input((val: any) => val).query(async ({ input }) => {
      const { getAllCustomFieldsByType } = await import('./db');
      return getAllCustomFieldsByType(input.entityType);
    }),
    create: adminProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { createCustomField } = await import('./db');
      // Add createdBy from context
      const fieldData = {
        ...input,
        createdBy: ctx.user.id,
      };
      await createCustomField(fieldData);
      return { success: true };
    }),
    update: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateCustomField } = await import('./db');
      const { id, ...updates } = input;
      await updateCustomField(id, updates);
      return { success: true };
    }),
    delete: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteCustomField } = await import('./db');
      await deleteCustomField(input.id);
      return { success: true };
    }),
  }),

  // Schema Modifications Management
  schemaModifications: router({
    getAll: adminProcedure.query(async () => {
      const { getAllSchemaModifications } = await import('./db');
      return getAllSchemaModifications();
    }),
    getPending: adminProcedure.query(async () => {
      const { getPendingSchemaModifications } = await import('./db');
      return getPendingSchemaModifications();
    }),
    create: adminProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { createSchemaModification } = await import('./db');
      const modData = {
        ...input,
        createdBy: ctx.user.id,
        status: 'pending' as const,
      };
      await createSchemaModification(modData);
      return { success: true };
    }),
    approve: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { updateSchemaModificationStatus } = await import('./db');
      await updateSchemaModificationStatus(input.id, 'approved');
      return { success: true };
    }),
    execute: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { executeSchemaModification } = await import('./db');
      try {
        await executeSchemaModification(input.id);
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }),
  }),

  // System Settings Management
  settings: router({
    get: adminProcedure.input((val: any) => val).query(async ({ input }) => {
      const { getSetting } = await import('./db');
      return getSetting(input.key);
    }),
    getAll: adminProcedure.query(async () => {
      const { getAllSettings } = await import('./db');
      return getAllSettings();
    }),
    set: adminProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { setSetting } = await import('./db');
      await setSetting({
        settingKey: input.key,
        settingValue: input.value,
        settingType: input.type || 'config',
        description: input.description,
        updatedBy: ctx.user.id,
      });
      return { success: true };
    }),
    delete: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteSetting } = await import('./db');
      await deleteSetting(input.key);
      return { success: true };
    }),
    testGrokApiKey: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      try {
        const apiKey = input.apiKey;
        if (!apiKey || !apiKey.trim()) {
          return {
            success: false,
            error: 'API key is required',
          };
        }

        // Make a simple test request to Grok API
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'grok-3',
            messages: [
              { role: 'user', content: 'Hello' }
            ],
            max_tokens: 10,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            error: `API Error: ${response.status} - ${errorText}`,
            status: response.status,
          };
        }

        const data = await response.json();
        return {
          success: true,
          message: 'Connection successful!',
          model: data.model,
          usage: data.usage,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to connect to Grok API',
        };
      }
    }),
  }),

  // AI Chat with Self-Learning
  aiChat: router({
    // Enhanced chat with Grok API and Collections
    sendMessage: protectedProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      try {
        const { invokeGrokWithLearning } = await import('./_core/grok');
        const { saveChatMessage, getChatHistory } = await import('./db');

        const userId = ctx.user.id;
        
        // Save user message
        await saveChatMessage({
          userId,
          role: 'user',
          content: input.message,
        });

        // Get conversation history
        const history = await getChatHistory(userId);
        const conversationHistory = history.slice(-10).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Call Grok with learning capabilities
        const assistantMessage = await invokeGrokWithLearning(
          input.message,
          conversationHistory,
          input.collectionId
        );

        // Save assistant message
        await saveChatMessage({
          userId,
          role: 'assistant',
          content: assistantMessage,
        });

        return { message: assistantMessage };
      } catch (error: any) {
        console.error('[AI Chat] Error:', error);
        
        // Check for specific error types
        const errorMessage = error.message || 'Unknown error';
        
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          throw new Error('Invalid Grok API key. Please update your API key in Settings.');
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          throw new Error('Grok API key does not have permission. Please check your API key.');
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          throw new Error('Grok API rate limit exceeded. Please try again later.');
        } else if (errorMessage.includes('API key') || errorMessage.includes('GROK_API_KEY')) {
          throw new Error('No Grok API key configured. Please add your API key in Settings.');
        } else {
          throw new Error(`Grok API error: ${errorMessage}`);
        }
      }
    }),
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const { getChatHistory } = await import('./db');
      const userId = ctx.user.id;
      return getChatHistory(userId);
    }),
    // Collection management
    createCollection: protectedProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { createCollection } = await import('./_core/grok');
      const collection = await createCollection(input.name, input.description);
      return collection;
    }),
    getCollections: protectedProcedure.query(async () => {
      const { getCollections } = await import('./_core/grok');
      return getCollections();
    }),
  }),

  // Legacy chat endpoint (keep for backward compatibility)
  chat: router({
    sendMessage: protectedProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { invokeLLM } = await import('./_core/llm');
      const { saveChatMessage } = await import('./db');

      const userId = ctx.user.id;

      // Save user message
      await saveChatMessage({
        userId,
        role: 'user',
        content: input.message,
      });

      // Call LLM
      const systemPrompt = `You are an AI assistant helping users input forex account credentials. Extract structured data from unorganized text.
When user provides account information, extract:
- account_login (account number)
- investor_password
- platform_type (meta4 or meta5)
- account_type (usd or cent)
- platform_name_server (broker name and server)
- bot_running (if mentioned)
- account_balance (if mentioned)

Respond in JSON format with the extracted fields. If information is missing, ask clarifying questions.`;

      const response = await invokeLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.message },
        ],
      });

      const assistantMessage = response.choices[0].message.content;

      // Save assistant message
      await saveChatMessage({
        userId,
        role: 'assistant',
        content: assistantMessage,
      });

      return { message: assistantMessage };
    }),
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const { getChatHistory } = await import('./db');
      return getChatHistory(ctx.user.id);
    }),
  }),

  // User-Account Access Management (linking users to accounts)
  userAccountAccess: router({
    // Link an account to a user (admin only)
    linkAccount: adminProcedure.input((val: any) => val).mutation(async ({ input, ctx }) => {
      const { linkAccountToUser, createNotification, getForexAccountById } = await import('./db');
      
      await linkAccountToUser(
        input.accountId,
        input.userId,
        input.canEdit,
        ctx.user.id
      );
      
      // Create notification for the user
      const account = await getForexAccountById(input.accountId);
      const permission = input.canEdit ? "edit" : "view";
      
      await createNotification({
        userId: input.userId,
        title: "Account Access Granted",
        message: `You now have ${permission} access to account "${account?.accountName || 'Unknown'}".`,
        type: "success",
        relatedEntityType: "account",
        relatedEntityId: input.accountId,
      });
      
      return { success: true };
    }),
    
    // Unlink an account from a user (admin only)
    unlinkAccount: adminProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { unlinkAccountFromUser, createNotification, getForexAccountById } = await import('./db');
      
      const account = await getForexAccountById(input.accountId);
      await unlinkAccountFromUser(input.accountId, input.userId);
      
      // Create notification for the user
      await createNotification({
        userId: input.userId,
        title: "Account Access Removed",
        message: `Your access to account "${account?.accountName || 'Unknown'}" has been removed.`,
        type: "warning",
        relatedEntityType: "account",
        relatedEntityId: input.accountId,
      });
      
      return { success: true };
    }),
    
    // Get all accounts a user has access to (owned + linked)
    getUserAccounts: protectedProcedure.query(async ({ ctx }) => {
      const { getUserLinkedAccounts } = await import('./db');
      return getUserLinkedAccounts(ctx.user.id);
    }),
    
    // Get all users who have access to an account (admin only)
    getAccountUsers: adminProcedure.input((val: any) => val).query(async ({ input }) => {
      const { getAccountLinkedUsers } = await import('./db');
      return getAccountLinkedUsers(input.accountId);
    }),
    
    // Check if user has permission to edit an account
    checkPermission: protectedProcedure.input((val: any) => val).query(async ({ input, ctx }) => {
      const { getUserAccountPermission } = await import('./db');
      return getUserAccountPermission(ctx.user.id, input.accountId);
    }),
  }),

  // Notifications
  notifications: router({
    // Get user's notifications
    getNotifications: protectedProcedure.query(async ({ ctx }) => {
      const { getUserNotifications } = await import('./db');
      return getUserNotifications(ctx.user.id);
    }),
    
    // Get unread notification count
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      const { getUnreadNotificationCount } = await import('./db');
      return getUnreadNotificationCount(ctx.user.id);
    }),
    
    // Mark a notification as read
    markAsRead: protectedProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { markNotificationAsRead } = await import('./db');
      await markNotificationAsRead(input.id);
      return { success: true };
    }),
    
    // Mark all notifications as read
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const { markAllNotificationsAsRead } = await import('./db');
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    
    // Delete a notification
    deleteNotification: protectedProcedure.input((val: any) => val).mutation(async ({ input }) => {
      const { deleteNotification } = await import('./db');
      await deleteNotification(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
