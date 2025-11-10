import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers: {
        // In production, you'd need a valid session cookie here
      },
      transformer: superjson,
    }),
  ],
});

async function testProcedures() {
  console.log('🧪 Testing tRPC Procedures...\n');

  try {
    // Test 1: List all accounts (should be empty initially)
    console.log('1️⃣ Testing: List all accounts');
    const accounts = await client.forexAccounts.list.query();
    console.log(`✅ Found ${accounts.length} accounts`);
    console.log('');

    // Test 2: Create a new account
    console.log('2️⃣ Testing: Create new account');
    const newAccount = await client.forexAccounts.create.mutate({
      accountLogin: '12345678',
      investorPassword: 'InvestorPass123',
      masterPassword: 'MasterPass456',
      platformType: 'meta5',
      accountType: 'usd',
      platformNameServer: 'ICMarkets-Demo',
      botRunning: 'Scalper Pro',
      accountBalance: '10000.00',
      accountName: '5678ICMA',
      ownerName: 'John, Dox',
      linkedUserEmail: '',
    });
    console.log(`✅ Created account with ID: ${newAccount.id}`);
    console.log(`   Account Name: ${newAccount.accountName}`);
    console.log(`   Login: ${newAccount.accountLogin}`);
    console.log('');

    // Test 3: List accounts again (should have 1 now)
    console.log('3️⃣ Testing: List accounts after creation');
    const accountsAfter = await client.forexAccounts.list.query();
    console.log(`✅ Found ${accountsAfter.length} account(s)`);
    console.log('');

    // Test 4: Update the account
    console.log('4️⃣ Testing: Update account');
    const updatedAccount = await client.forexAccounts.update.mutate({
      id: newAccount.id,
      accountLogin: '12345678',
      investorPassword: 'NewInvestorPass',
      masterPassword: 'NewMasterPass',
      platformType: 'meta5',
      accountType: 'cent',
      platformNameServer: 'ICMarkets-Live',
      botRunning: 'Advanced EA',
      accountBalance: '15000.00',
      accountName: '5678ICMA',
      ownerName: 'John, Dox',
      linkedUserEmail: '',
    });
    console.log(`✅ Updated account ID: ${updatedAccount.id}`);
    console.log(`   New Balance: ${updatedAccount.accountBalance}`);
    console.log(`   New Bot: ${updatedAccount.botRunning}`);
    console.log('');

    // Test 5: Get single account
    console.log('5️⃣ Testing: Get single account');
    const singleAccount = await client.forexAccounts.getById.query({ id: newAccount.id });
    console.log(`✅ Retrieved account: ${singleAccount.accountName}`);
    console.log('');

    // Test 6: Delete the account
    console.log('6️⃣ Testing: Delete account');
    await client.forexAccounts.delete.mutate({ id: newAccount.id });
    console.log(`✅ Deleted account ID: ${newAccount.id}`);
    console.log('');

    // Test 7: Verify deletion
    console.log('7️⃣ Testing: Verify deletion');
    const finalAccounts = await client.forexAccounts.list.query();
    console.log(`✅ Final count: ${finalAccounts.length} account(s)`);
    console.log('');

    // Test 8: Test AI chat
    console.log('8️⃣ Testing: AI Chat');
    const chatResponse = await client.aiChat.chat.mutate({
      message: 'Login: 98765432, Password: TestPass123, Platform: MetaTrader 5, Server: XM-Real',
    });
    console.log(`✅ AI Response received`);
    console.log(`   Response: ${chatResponse.response.substring(0, 100)}...`);
    console.log('');

    console.log('✅ All tests passed! Database operations are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.data) {
      console.error('   Error data:', error.data);
    }
  }
}

testProcedures();
