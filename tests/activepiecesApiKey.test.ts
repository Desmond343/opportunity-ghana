import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  generateNewApiKey,
  revokeCurrentApiKey,
  getActivepiecesConfig,
  getPublicActivepiecesConfig,
  verifyActivepiecesAuth,
  generateActivepiecesFlowJson,
  PRODUCTION_ACTIVEPIECES_BASE_URL
} from '../server/activepiecesService';

// Test runner assertion helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ACTIVEPIECES API KEY SECURITY & WORKFLOW TESTS');
  console.log('======================================================\n');

  // Test 1: Production Base URL Verification
  console.log('Test 1: Mandatory Production Base URL Constants & Workflow Generation');
  assert(
    PRODUCTION_ACTIVEPIECES_BASE_URL === 'https://opportunityghana.site',
    'PRODUCTION_ACTIVEPIECES_BASE_URL is exactly https://opportunityghana.site'
  );

  const flow = generateActivepiecesFlowJson();
  assert(flow !== null && typeof flow === 'object', 'Flow definition generated successfully');

  // Step 1 check
  const step1 = flow.trigger.nextAction;
  assert(step1.name === 'step_1', 'Step 1 is present in flow');
  assert(
    step1.settings.input.url === 'https://opportunityghana.site/api/activepieces/subscribers',
    'Step 1 URL is exactly https://opportunityghana.site/api/activepieces/subscribers'
  );
  assert(
    step1.settings.input.headers['Authorization'] === 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
    'Step 1 uses Authorization: Bearer placeholder without hardcoded secret'
  );

  // Step 2 check
  const step2 = step1.nextAction;
  assert(step2.name === 'step_2', 'Step 2 is present in flow');
  assert(
    step2.settings.input.url === 'https://opportunityghana.site/api/activepieces/opportunities',
    'Step 2 URL is exactly https://opportunityghana.site/api/activepieces/opportunities'
  );
  assert(
    step2.settings.input.headers['Authorization'] === 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
    'Step 2 uses Authorization: Bearer placeholder'
  );

  // Step 3 check
  const step3 = step2.nextAction;
  assert(step3.name === 'step_3', 'Step 3 is present in flow');
  assert(
    step3.settings.input.url === 'https://opportunityghana.site/api/activepieces/trigger-daily-run',
    'Step 3 URL is exactly https://opportunityghana.site/api/activepieces/trigger-daily-run'
  );
  assert(
    step3.settings.input.headers['Authorization'] === 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
    'Step 3 uses Authorization: Bearer placeholder'
  );

  // Ensure no dev / localhost URLs anywhere in flow JSON
  const flowJsonString = JSON.stringify(flow);
  assert(!flowJsonString.includes('localhost'), 'Workflow JSON contains no localhost references');
  assert(!flowJsonString.includes('127.0.0.1'), 'Workflow JSON contains no 127.0.0.1 references');
  assert(!flowJsonString.includes('http://'), 'Workflow JSON contains no insecure http:// URLs');

  console.log('\nTest 2: Cryptographic Key Generation & SHA-256 Storage');
  const genResult = generateNewApiKey({
    name: 'Test Administrator',
    email: 'admin@opportunityghana.com'
  });

  const rawKey1 = genResult.rawKey;
  assert(typeof rawKey1 === 'string' && rawKey1.startsWith('og_live_'), 'Key starts with og_live_ prefix');
  assert(rawKey1.length >= 64, 'Key has strong cryptographic entropy (>= 64 chars)');

  const configOnDisk = getActivepiecesConfig();
  assert(Boolean(configOnDisk.currentApiKey), 'Key info persisted to config');
  assert(configOnDisk.currentApiKey?.status === 'active', 'Key status is active');

  // Verify hash storage - never raw key
  const expectedHash = crypto.createHash('sha256').update(rawKey1).digest('hex');
  assert(configOnDisk.currentApiKey?.keyHash === expectedHash, 'Key stored as SHA-256 hash');
  assert((configOnDisk as any).apiKey === undefined, 'Raw apiKey field is stripped from stored config');

  // Verify public config masking
  const publicConfig = getPublicActivepiecesConfig();
  assert(!JSON.stringify(publicConfig).includes(rawKey1), 'Public config never contains raw key');
  assert(!JSON.stringify(publicConfig).includes(expectedHash), 'Public config never contains key hash');
  assert(publicConfig.apiKeyInfo.status === 'active', 'Public config shows active status');
  assert(publicConfig.apiKeyInfo.maskedDisplay.includes('••••••••'), 'Public config masks the key');

  console.log('\nTest 3: Authentication Middleware Validation');
  // Mock Express Request & Response helper
  function mockReqRes(headers: Record<string, string>) {
    let statusCode = 200;
    let jsonBody: any = null;
    let nextCalled = false;

    const req: any = { headers };
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonBody = data;
        return this;
      }
    };
    const next = () => {
      nextCalled = true;
    };

    return { req, res, next, getResult: () => ({ statusCode, jsonBody, nextCalled }) };
  }

  // 3a: Valid Bearer token
  const validMock = mockReqRes({ authorization: `Bearer ${rawKey1}` });
  verifyActivepiecesAuth(validMock.req, validMock.res, validMock.next);
  assert(validMock.getResult().nextCalled, 'Valid Bearer token passes verification (next() called)');

  // 3b: Valid x-api-key header (backward compatibility)
  const xApiKeyMock = mockReqRes({ 'x-api-key': rawKey1 });
  verifyActivepiecesAuth(xApiKeyMock.req, xApiKeyMock.res, xApiKeyMock.next);
  assert(xApiKeyMock.getResult().nextCalled, 'Valid x-api-key header passes verification');

  // 3c: Missing token
  const missingMock = mockReqRes({});
  verifyActivepiecesAuth(missingMock.req, missingMock.res, missingMock.next);
  assert(missingMock.getResult().statusCode === 401, 'Missing token returns HTTP 401');
  assert(missingMock.getResult().nextCalled === false, 'Missing token blocks next()');

  // 3d: Invalid / forged token
  const invalidMock = mockReqRes({ authorization: 'Bearer og_live_fake_invalid_token_12345' });
  verifyActivepiecesAuth(invalidMock.req, invalidMock.res, invalidMock.next);
  assert(invalidMock.getResult().statusCode === 401, 'Invalid token returns HTTP 401');
  assert(invalidMock.getResult().nextCalled === false, 'Invalid token blocks next()');

  console.log('\nTest 4: Key Revocation');
  const revokeRes = revokeCurrentApiKey({ email: 'admin@opportunityghana.com' });
  assert(revokeRes.success, 'Revoke operation succeeded');
  assert(revokeRes.keyInfo?.status === 'revoked', 'Key status updated to revoked');
  assert(Boolean(revokeRes.keyInfo?.revokedAt), 'revokedAt timestamp recorded');

  // Verify revoked key is now rejected
  const revokedMock = mockReqRes({ authorization: `Bearer ${rawKey1}` });
  verifyActivepiecesAuth(revokedMock.req, revokedMock.res, revokedMock.next);
  assert(revokedMock.getResult().statusCode === 401, 'Revoked key returns HTTP 401');
  assert(revokedMock.getResult().jsonBody?.code === 'auth/key-revoked', 'Revoked key returns auth/key-revoked error code');

  console.log('\nTest 5: Key Rotation');
  // Rotate by generating key 2
  const rotateRes = generateNewApiKey({
    name: 'Test Administrator',
    email: 'admin@opportunityghana.com'
  });
  const rawKey2 = rotateRes.rawKey;
  assert(rawKey2 !== rawKey1, 'Rotated key has distinct new random bytes');

  // Key 1 must remain rejected
  const oldKeyMock = mockReqRes({ authorization: `Bearer ${rawKey1}` });
  verifyActivepiecesAuth(oldKeyMock.req, oldKeyMock.res, oldKeyMock.next);
  assert(oldKeyMock.getResult().statusCode === 401, 'Prior rotated key continues to be rejected');

  // Key 2 must now succeed
  const newKeyMock = mockReqRes({ authorization: `Bearer ${rawKey2}` });
  verifyActivepiecesAuth(newKeyMock.req, newKeyMock.res, newKeyMock.next);
  assert(newKeyMock.getResult().nextCalled, 'New rotated key succeeds immediately');

  console.log('\n======================================================');
  console.log('✅ ALL ACTIVEPIECES API KEY SECURITY TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
