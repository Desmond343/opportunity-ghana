import http from 'http';
import app from '../server.ts';
import serverlessHandler from '../api/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runProductionApiTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PRODUCTION API KEY & ENDPOINTS INTEGRATION TESTS');
  console.log('======================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Test 1: Signed-out user cannot generate a key (401)
    console.log('Test 1: Unauthenticated request rejection');
    const unauthRes = await fetch(`${baseUrl}/api/admin/activepieces/api-key/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(unauthRes.status === 401, 'Signed-out request to key generator returns HTTP 401');
    const unauthBody = await unauthRes.json();
    assert(unauthBody.code === 'auth/missing-token', 'Rejection code is auth/missing-token');

    // Test 2: Non-admin user cannot generate a key (403)
    console.log('\nTest 2: Non-admin account forbidden');
    const nonAdminRes = await fetch(`${baseUrl}/api/admin/activepieces/api-key/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer user-bypass'
      }
    });
    assert(nonAdminRes.status === 403, 'Normal user request returns HTTP 403 Forbidden');
    const nonAdminBody = await nonAdminRes.json();
    assert(nonAdminBody.code === 'auth/forbidden', 'Rejection code is auth/forbidden');

    // Test 3: Authorized administrator can generate a key successfully (200)
    console.log('\nTest 3: Authorized administrator key generation');
    const adminRes = await fetch(`${baseUrl}/api/admin/activepieces/api-key/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-bypass'
      }
    });
    assert(adminRes.status === 200, 'Authorized admin generates key with HTTP 200');
    const adminBody = await adminRes.json();
    assert(adminBody.success === true, 'Response reports success: true');
    assert(typeof adminBody.apiKey === 'string' && adminBody.apiKey.startsWith('og_live_'), 'Plaintext apiKey returned with og_live_ prefix');
    assert(adminBody.keyInfo.status === 'active', 'keyInfo status is active');
    assert(Boolean(adminBody.keyInfo.maskedDisplay), 'keyInfo contains masked display');

    const generatedApiKey = adminBody.apiKey;

    // Test 4: Authenticate with all three Activepieces endpoints using generated key
    console.log('\nTest 4: Activepieces Endpoints Authentication');

    // 4a: GET /api/activepieces/subscribers
    const subRes = await fetch(`${baseUrl}/api/activepieces/subscribers`, {
      headers: { Authorization: `Bearer ${generatedApiKey}` }
    });
    assert(subRes.status === 200, 'GET /api/activepieces/subscribers authenticates with new key (HTTP 200)');
    const subData = await subRes.json();
    assert(subData.success === true && Array.isArray(subData.subscribers), 'Subscribers payload received');

    // 4b: GET /api/activepieces/opportunities
    const oppRes = await fetch(`${baseUrl}/api/activepieces/opportunities`, {
      headers: { Authorization: `Bearer ${generatedApiKey}` }
    });
    assert(oppRes.status === 200, 'GET /api/activepieces/opportunities authenticates with new key (HTTP 200)');
    const oppData = await oppRes.json();
    assert(oppData.success === true && Array.isArray(oppData.opportunities), 'Opportunities payload received');

    // 4c: POST /api/activepieces/trigger-daily-run
    const triggerRes = await fetch(`${baseUrl}/api/activepieces/trigger-daily-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${generatedApiKey}`
      },
      body: JSON.stringify({ dryRun: true })
    });
    assert(triggerRes.status === 200, 'POST /api/activepieces/trigger-daily-run authenticates with new key (HTTP 200)');

    // Test 5: Rejection of missing, invalid, and forged keys
    console.log('\nTest 5: Rejection of missing and forged keys');
    const noKeyRes = await fetch(`${baseUrl}/api/activepieces/subscribers`);
    assert(noKeyRes.status === 401, 'Missing key request is rejected with HTTP 401');

    const invalidKeyRes = await fetch(`${baseUrl}/api/activepieces/subscribers`, {
      headers: { Authorization: 'Bearer og_live_invalid_fake_key_9999' }
    });
    assert(invalidKeyRes.status === 401, 'Forged key request is rejected with HTTP 401');

    // Test 6: Revocation and immediate invalidation
    console.log('\nTest 6: Key revocation and immediate rejection');
    const revokeRes = await fetch(`${baseUrl}/api/admin/activepieces/api-key/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-bypass'
      }
    });
    assert(revokeRes.status === 200, 'Revoke endpoint returns HTTP 200');
    const revokeBody = await revokeRes.json();
    assert(revokeBody.success === true, 'Revocation marked success: true');

    // Key must now be rejected with 401
    const postRevokeRes = await fetch(`${baseUrl}/api/activepieces/subscribers`, {
      headers: { Authorization: `Bearer ${generatedApiKey}` }
    });
    assert(postRevokeRes.status === 401, 'Revoked key is immediately rejected with HTTP 401');
    const postRevokeBody = await postRevokeRes.json();
    assert(postRevokeBody.code === 'auth/key-revoked', 'Error code confirms auth/key-revoked');

    // Test 7: Verify Vercel Serverless Function Handler
    console.log('\nTest 7: Vercel serverless function entrypoint');
    assert(typeof serverlessHandler === 'function', 'api/index.ts exports a valid serverless handler function');

    console.log('\n======================================================');
    console.log('✅ ALL PRODUCTION API INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runProductionApiTests().catch((err) => {
  console.error('Production API test suite failed:', err);
  process.exit(1);
});
