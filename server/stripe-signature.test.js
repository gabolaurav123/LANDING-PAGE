import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { verifyStripeSignature } from './stripe-signature.js';

test('verifies a valid Stripe webhook signature', () => {
  const payload = JSON.stringify({ id: 'evt_test' });
  const secret = 'test_webhook_secret';
  const timestamp = 1_700_000_000;
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');

  assert.equal(
    verifyStripeSignature({
      payload: Buffer.from(payload),
      signatureHeader: `t=${timestamp},v1=${signature}`,
      secret,
      now: timestamp,
    }),
    true,
  );
});

test('rejects invalid or expired Stripe webhook signatures', () => {
  const payload = JSON.stringify({ id: 'evt_test' });

  assert.equal(
    verifyStripeSignature({
      payload: Buffer.from(payload),
      signatureHeader: 't=1700000000,v1=invalid',
      secret: 'test_webhook_secret',
      now: 1_700_000_000,
    }),
    false,
  );

  assert.equal(
    verifyStripeSignature({
      payload: Buffer.from(payload),
      signatureHeader: 't=1700000000,v1=invalid',
      secret: 'test_webhook_secret',
      now: 1_700_001_000,
    }),
    false,
  );
});
