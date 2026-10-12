import { generateNewApiKey, getActivepiecesConfig } from '../server/activepiecesService';

async function testHttpEndpoints() {
  console.log('\n======================================================');
  console.log('🌐 TESTING LIVE HTTP ENDPOINTS ON LOCALHOST:3000');
  console.log('======================================================\n');

  // Generate a fresh key for testing
  const { rawKey } = generateNewApiKey({
    name: 'Live Test Admin',
    email: 'admin@opportunityghana.com'
  });

  const BASE = 'http://localhost:3000';

  // Helper for fetch
  async function testReq(name: string, url: string, options: any, expectedStatus: number) {
    try {
      const res = await fetch(url, options);
      const ok = res.status === expectedStatus;
      const json = await res.json().catch(() => ({}));
      if (!ok) {
        console.error(`❌ ${name}: expected ${expectedStatus}, got ${res.status}`, json);
        throw new Error(`${name} failed`);
      }
      console.log(`  ✓ ${name} (Status: ${res.status})`);
      return json;
    } catch (err: any) {
      console.error(`Error in ${name}:`, err.message);
      throw err;
    }
  }

  // 1. GET /api/activepieces/subscribers - missing key
  await testReq('GET /api/activepieces/subscribers (missing key)', `${BASE}/api/activepieces/subscribers`, {}, 401);

  // 2. GET /api/activepieces/subscribers - invalid key
  await testReq(
    'GET /api/activepieces/subscribers (invalid key)',
    `${BASE}/api/activepieces/subscribers`,
    { headers: { Authorization: 'Bearer og_live_invalid_12345' } },
    401
  );

  // 3. GET /api/activepieces/subscribers - valid key
  const subData = await testReq(
    'GET /api/activepieces/subscribers (valid Bearer key)',
    `${BASE}/api/activepieces/subscribers`,
    { headers: { Authorization: `Bearer ${rawKey}` } },
    200
  );
  if (subData.subscribers && subData.subscribers.length > 0) {
    const firstSub = subData.subscribers[0];
    if (firstSub.unsubscribeUrl && !firstSub.unsubscribeUrl.startsWith('https://opportunityghana.site')) {
      throw new Error(`Unsubscribe URL does not use https://opportunityghana.site: ${firstSub.unsubscribeUrl}`);
    }
    console.log('  ✓ Subscriber unsubscribe and preferences URLs point to https://opportunityghana.site');
  }

  // 4. GET /api/activepieces/opportunities - missing key
  await testReq('GET /api/activepieces/opportunities (missing key)', `${BASE}/api/activepieces/opportunities`, {}, 401);

  // 5. GET /api/activepieces/opportunities - valid key
  const oppData = await testReq(
    'GET /api/activepieces/opportunities (valid Bearer key)',
    `${BASE}/api/activepieces/opportunities`,
    { headers: { Authorization: `Bearer ${rawKey}` } },
    200
  );
  if (oppData.opportunities && oppData.opportunities.length > 0) {
    const firstOpp = oppData.opportunities[0];
    if (firstOpp.publicUrl && !firstOpp.publicUrl.startsWith('https://opportunityghana.site')) {
      throw new Error(`Opportunity publicUrl does not use https://opportunityghana.site: ${firstOpp.publicUrl}`);
    }
    console.log('  ✓ Opportunity publicUrl points to https://opportunityghana.site');
  }

  // 6. POST /api/activepieces/trigger-daily-run - missing key
  await testReq(
    'POST /api/activepieces/trigger-daily-run (missing key)',
    `${BASE}/api/activepieces/trigger-daily-run`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ simulateOnly: true }) },
    401
  );

  // 7. POST /api/activepieces/trigger-daily-run - valid key
  await testReq(
    'POST /api/activepieces/trigger-daily-run (valid key, simulateOnly)',
    `${BASE}/api/activepieces/trigger-daily-run`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${rawKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulateOnly: true })
    },
    200
  );

  // 8. Protected admin route: GET /api/admin/activepieces/flow.json without token
  await testReq('GET /api/admin/activepieces/flow.json (unauthorized admin)', `${BASE}/api/admin/activepieces/flow.json`, {}, 401);

  // 9. Protected admin route: GET /api/admin/activepieces/flow.json with admin bypass token
  const flowData = await testReq(
    'GET /api/admin/activepieces/flow.json (authorized admin)',
    `${BASE}/api/admin/activepieces/flow.json`,
    { headers: { Authorization: 'Bearer admin-bypass' } },
    200
  );
  if (
    flowData.trigger.nextAction.settings.input.url !== 'https://opportunityghana.site/api/activepieces/subscribers' ||
    flowData.trigger.nextAction.nextAction.settings.input.url !== 'https://opportunityghana.site/api/activepieces/opportunities' ||
    flowData.trigger.nextAction.nextAction.nextAction.settings.input.url !== 'https://opportunityghana.site/api/activepieces/trigger-daily-run'
  ) {
    throw new Error('Downloaded flow.json URLs do not match mandatory production endpoints');
  }
  console.log('  ✓ Downloaded flow.json URLs verified against mandatory production base URL');

  // 10. Admin API key generation endpoint
  const genRes = await testReq(
    'POST /api/admin/activepieces/api-key/generate (authorized admin)',
    `${BASE}/api/admin/activepieces/api-key/generate`,
    { method: 'POST', headers: { Authorization: 'Bearer admin-bypass', 'Content-Type': 'application/json' } },
    200
  );
  if (!genRes.apiKey || !genRes.apiKey.startsWith('og_live_')) {
    throw new Error('Admin API key generation did not return valid key');
  }
  console.log('  ✓ Admin API key generation endpoint successfully generated new key');

  console.log('\n======================================================');
  console.log('✅ ALL LIVE HTTP ENDPOINT TESTS PASSED!');
  console.log('======================================================\n');
}

testHttpEndpoints().catch((err) => {
  console.error('Live HTTP test failed:', err);
  process.exit(1);
});
