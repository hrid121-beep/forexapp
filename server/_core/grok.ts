import { ENV } from './env';

/**
 * Grok API Client with Collections support for conversation memory
 * https://docs.x.ai/docs/key-information/collections
 */

const GROK_API_URL = 'https://api.x.ai/v1';

// Get Grok API key from database or environment variable
async function getGrokApiKey(): Promise<string> {
  try {
    const { getSetting } = await import('../db');
    const setting = await getSetting('grok_api_key');
    if (setting && setting.settingValue) {
      console.log('[Grok] Using API key from database');
      return setting.settingValue;
    }
  } catch (error) {
    console.warn('[Grok] Failed to fetch API key from database:', error);
  }
  
  // Fallback to environment variable
  const envKey = process.env.GROK_API_KEY || '';
  if (envKey) {
    console.log('[Grok] Using API key from environment variable');
    return envKey;
  }
  
  // No API key found
  console.error('[Grok] No API key configured in database or environment');
  throw new Error('No Grok API key configured. Please add your API key in Settings.');
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokChatOptions {
  messages: GrokMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  collection_id?: string; // For conversation memory
}

export interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GrokCollection {
  id: string;
  name: string;
  description?: string;
  created_at: number;
  updated_at: number;
}

/**
 * Send a chat completion request to Grok API
 */
export async function invokeGrok(options: GrokChatOptions): Promise<GrokResponse> {
  const {
    messages,
    model = 'grok-3',
    temperature = 0.7,
    max_tokens = 2000,
    stream = false,
    collection_id,
  } = options;

  const requestBody: any = {
    model,
    messages,
    temperature,
    max_tokens,
    stream,
  };

  // Add collection_id if provided for conversation memory
  if (collection_id) {
    requestBody.collection_id = collection_id;
  }

  const apiKey = await getGrokApiKey();
  
  // Add timeout to prevent hanging connections
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(`${GROK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[AI Chat] Request timeout after 30 seconds');
      throw new Error('Request timeout. Please check your internet connection and try again.');
    }
    if (error.cause?.code === 'ECONNRESET' || error.message.includes('fetch failed')) {
      console.error('[AI Chat] Network error:', error);
      throw new Error('Network connection failed. Please check your internet connection and Grok API key.');
    }
    throw error;
  }
}

/**
 * Create a new collection for conversation memory
 */
export async function createCollection(name: string, description?: string): Promise<GrokCollection> {
  const apiKey = await getGrokApiKey();
  const response = await fetch(`${GROK_API_URL}/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error creating collection: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get all collections
 */
export async function getCollections(): Promise<GrokCollection[]> {
  const apiKey = await getGrokApiKey();
  const response = await fetch(`${GROK_API_URL}/collections`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error fetching collections: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.collections || [];
}

/**
 * Get a specific collection by ID
 */
export async function getCollection(collectionId: string): Promise<GrokCollection> {
  const apiKey = await getGrokApiKey();
  const response = await fetch(`${GROK_API_URL}/collections/${collectionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error fetching collection: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  const apiKey = await getGrokApiKey();
  const response = await fetch(`${GROK_API_URL}/collections/${collectionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error deleting collection: ${response.status} - ${errorText}`);
  }
}

/**
 * Helper function to invoke Grok with system learning capabilities
 * This is the main function for the self-learning AI chat
 */
export async function invokeGrokWithLearning(
  userMessage: string,
  conversationHistory: GrokMessage[],
  collectionId?: string
): Promise<string> {
  const systemPrompt: GrokMessage = {
    role: 'system',
    content: `You are an advanced AI assistant for JSR Algo forex tracker system with self-learning capabilities.

Your responsibilities:
1. **Data Extraction**: Extract forex account credentials from natural language
2. **Custom Fields**: Create custom fields when admin requests new data tracking
3. **Schema Modifications**: Propose database schema changes when needed
4. **Data Management**: Help admin manage forex accounts, users, and custom data

**CRITICAL RULES FOR DATA EXTRACTION:**

1. When user provides incomplete data, ask clarifying questions with SPECIFIC OPTIONS:
   - For Platform Type: Ask EXACTLY: "Is this MetaTrader 4 or MetaTrader 5?" (buttons will appear automatically)
   - For Account Type: Ask EXACTLY: "Is this a USD account or Cent account?" (buttons will appear automatically)
   - For Server: "What's the broker name and server? (e.g., Exness-Real1)"
   
   IMPORTANT: When asking about Platform Type or Account Type, use the EXACT phrasing above so the UI can show interactive selection buttons.

2. ONLY output JSON when you have ALL required fields:
   - account_login (required)
   - investor_password (required)
   - platform_type (required: "meta4" or "meta5")
   - account_type (required: "usd" or "cent")
   - platform_name_server (required)
   - master_password (optional)
   - bot_running (optional)
   - account_balance (optional, default to 0)

3. When outputting JSON, use this EXACT format:
\`\`\`json
{
  "account_login": "account number",
  "investor_password": "password",
  "master_password": "master password if provided",
  "platform_type": "meta4" or "meta5",
  "account_type": "usd" or "cent",
  "platform_name_server": "broker name and server",
  "bot_running": "bot name if mentioned",
  "account_balance": 0
}
\`\`\`

4. The JSON will be hidden from the user, so add a friendly message BEFORE the JSON like:
   "Perfect! I've got all the details. The account form is now filled and ready for you to review."

When admin asks to add a new field or track new information:
- First, try to use custom fields (instant, safe)
- If custom fields aren't suitable, propose a schema modification

Be conversational, friendly, and helpful.`,
  };

  const messages: GrokMessage[] = [
    systemPrompt,
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await invokeGrok({
    messages,
    collection_id: collectionId,
    temperature: 0.8,
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
}
