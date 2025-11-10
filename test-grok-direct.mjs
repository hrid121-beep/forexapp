/**
 * Direct Grok API test
 */

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1';

console.log("=== Direct Grok API Test ===\n");
console.log("API Key:", GROK_API_KEY ? `${GROK_API_KEY.substring(0, 10)}...` : "MISSING");
console.log("API URL:", GROK_API_URL);

try {
  const response = await fetch(`${GROK_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Extract account data and respond in JSON format.'
        },
        {
          role: 'user',
          content: '5510011046 Abcde12345@@'
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  console.log("\nResponse Status:", response.status);
  console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

  const data = await response.json();
  console.log("\nResponse Data:", JSON.stringify(data, null, 2));

  if (response.ok) {
    console.log("\n✅ Grok API is working!");
    const message = data.choices[0].message.content;
    console.log("\nAssistant Message:", message);
  } else {
    console.log("\n❌ Grok API error:", data);
  }
} catch (error) {
  console.log("\n❌ Test failed:", error.message);
  console.log("Stack:", error.stack);
}
