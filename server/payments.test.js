import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPaymentLinkUrl,
  completePaidPayment,
  normalizeEmail,
  normalizeName,
  ServiceError,
} from './payments.js';

test('buildPaymentLinkUrl preserves existing query parameters', () => {
  const result = new URL(
    buildPaymentLinkUrl('https://buy.stripe.com/test?locale=es', {
      paymentId: 'pay_test',
      email: 'buyer@example.com',
    }),
  );

  assert.equal(result.searchParams.get('locale'), 'es');
  assert.equal(result.searchParams.get('client_reference_id'), 'pay_test');
  assert.equal(result.searchParams.get('prefilled_email'), 'buyer@example.com');
});

test('normalizes customer input and rejects invalid email', () => {
  assert.equal(normalizeEmail(' Buyer@Example.com '), 'buyer@example.com');
  assert.equal(normalizeName('  Ada Lovelace  '), 'Ada Lovelace');
  assert.throws(() => normalizeEmail('invalid'), ServiceError);
});

test('completePaidPayment increments availability only on the first paid transition', async () => {
  let paymentStatus = 'pending';
  let counterUpdates = 0;
  let paymentUpdates = 0;

  const client = {
    async query(sql) {
      if (sql.includes('SELECT id, status, counter_key')) {
        return { rowCount: 1, rows: [{ id: 'pay_test', status: paymentStatus, counter_key: 'main' }] };
      }

      if (sql.includes('UPDATE campaign_counters')) {
        counterUpdates += 1;
        return { rowCount: 1, rows: [{ sold_count: 1, total_quantity: 100 }] };
      }

      if (sql.includes('UPDATE payments')) {
        paymentUpdates += 1;
        paymentStatus = 'paid';
        return { rowCount: 1, rows: [] };
      }

      return { rowCount: 0, rows: [] };
    },
    release() {},
  };
  const database = { async connect() { return client; } };
  const session = {
    id: 'cs_test',
    client_reference_id: 'pay_test',
    payment_status: 'paid',
    payment_intent: 'pi_test',
    amount_total: 7900,
    currency: 'usd',
    customer_details: { email: 'buyer@example.com' },
  };

  assert.deepEqual(await completePaidPayment(session, database), {
    outcome: 'paid',
    counterIncremented: true,
  });
  assert.deepEqual(await completePaidPayment(session, database), { outcome: 'already_paid' });
  assert.equal(counterUpdates, 1);
  assert.equal(paymentUpdates, 1);
});
