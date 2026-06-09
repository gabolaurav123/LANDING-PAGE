import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assignPremiumCodeForPayment,
  buildPaymentLinkUrl,
  completePaidPayment,
  getFounderAccessPayment,
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
  let premiumCodeUpdates = 0;

  const client = {
    async query(sql) {
      if (sql.includes('FROM payments') && sql.includes('FOR UPDATE')) {
        return {
          rowCount: 1,
          rows: [
            {
              id: 'pay_test',
              email: 'buyer@example.com',
              name: 'Buyer',
              status: paymentStatus,
              counter_key: 'main',
            },
          ],
        };
      }

      if (sql.includes('UPDATE campaign_counters')) {
        counterUpdates += 1;
        return { rowCount: 1, rows: [{ sold_count: 1, total_quantity: 100 }] };
      }

      if (sql.includes("status = 'paid'")) {
        paymentUpdates += 1;
        paymentStatus = 'paid';
        return { rowCount: 1, rows: [] };
      }

      if (sql.includes('FROM premium_codes') && sql.includes("status = 'available'")) {
        return { rowCount: 1, rows: [{ id: 9, code: 'PREMIUM-009' }] };
      }

      if (sql.includes('UPDATE premium_codes')) {
        premiumCodeUpdates += 1;
        return { rowCount: 1, rows: [] };
      }

      if (sql.includes('UPDATE payments') && sql.includes('premium_code_id')) {
        return { rowCount: 1, rows: [] };
      }

      if (sql.includes('INSERT INTO tracking_events')) {
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
  assert.equal(premiumCodeUpdates, 1);
});

test('getFounderAccessPayment returns payment status for access checks', async () => {
  const database = {
    async query(_sql, params) {
      assert.deepEqual(params, ['pay_test']);
      return {
        rowCount: 1,
        rows: [
          {
            id: 'pay_test',
            email: 'buyer@example.com',
            name: 'Buyer',
            status: 'paid',
            premiumCode: null,
            premiumCodeAssignedAt: null,
            premiumCodeError: null,
          },
        ],
      };
    },
  };

  assert.deepEqual(await getFounderAccessPayment('pay_test', database), {
    id: 'pay_test',
    email: 'buyer@example.com',
    name: 'Buyer',
    status: 'paid',
    premiumCode: null,
    premiumCodeAssignedAt: null,
    premiumCodeError: null,
  });
});

test('assignPremiumCodeForPayment reserves one available code for a paid payment', async () => {
  let codeReserved = false;
  let paymentUpdated = false;
  let eventInserted = false;

  const client = {
    async query(sql, params) {
      if (sql.includes('SELECT') && sql.includes('FROM payments') && sql.includes('FOR UPDATE')) {
        assert.deepEqual(params, ['pay_test']);
        return {
          rowCount: 1,
          rows: [
            {
              id: 'pay_test',
              email: 'buyer@example.com',
              name: 'Buyer',
              status: 'paid',
              premiumCode: null,
            },
          ],
        };
      }

      if (sql.includes('FROM premium_codes') && sql.includes("status = 'available'")) {
        return { rowCount: 1, rows: [{ id: 7, code: 'PREMIUM-001' }] };
      }

      if (sql.includes('UPDATE premium_codes')) {
        codeReserved = true;
        assert.deepEqual(params, [7, 'buyer@example.com', 'pay_test']);
        return { rowCount: 1, rows: [] };
      }

      if (sql.includes('UPDATE payments') && sql.includes('premium_code_id')) {
        paymentUpdated = true;
        assert.deepEqual(params, ['pay_test', '7', 'PREMIUM-001']);
        return {
          rowCount: 1,
          rows: [{ premiumCodeAssignedAt: new Date('2026-06-09T00:00:00Z') }],
        };
      }

      if (sql.includes('INSERT INTO tracking_events')) {
        eventInserted = true;
        return { rowCount: 1, rows: [] };
      }

      return { rowCount: 0, rows: [] };
    },
    release() {},
  };
  const database = { async connect() { return client; } };

  const result = await assignPremiumCodeForPayment('pay_test', database);

  assert.equal(result.premiumCode, 'PREMIUM-001');
  assert.equal(result.codeStatus, 'reserved');
  assert.equal(result.noCodesAvailable, false);
  assert.equal(codeReserved, true);
  assert.equal(paymentUpdated, true);
  assert.equal(eventInserted, true);
});

test('assignPremiumCodeForPayment is idempotent when payment already has a code', async () => {
  let codeQueried = false;

  const client = {
    async query(sql) {
      if (sql.includes('SELECT') && sql.includes('FROM payments') && sql.includes('FOR UPDATE')) {
        return {
          rowCount: 1,
          rows: [
            {
              id: 'pay_test',
              email: 'buyer@example.com',
              name: 'Buyer',
              status: 'paid',
              premiumCode: 'PREMIUM-001',
              premiumCodeAssignedAt: '2026-06-09T00:00:00.000Z',
            },
          ],
        };
      }

      if (sql.includes('FROM premium_codes')) {
        codeQueried = true;
      }

      return { rowCount: 0, rows: [] };
    },
    release() {},
  };
  const database = { async connect() { return client; } };

  assert.deepEqual(await assignPremiumCodeForPayment('pay_test', database), {
    paymentId: 'pay_test',
    email: 'buyer@example.com',
    name: 'Buyer',
    premiumCode: 'PREMIUM-001',
    premiumCodeAssignedAt: '2026-06-09T00:00:00.000Z',
    codeStatus: 'reserved',
    noCodesAvailable: false,
  });
  assert.equal(codeQueried, false);
});

test('assignPremiumCodeForPayment returns pending when no codes are available', async () => {
  let errorRecorded = false;

  const client = {
    async query(sql) {
      if (sql.includes('SELECT') && sql.includes('FROM payments') && sql.includes('FOR UPDATE')) {
        return {
          rowCount: 1,
          rows: [
            {
              id: 'pay_test',
              email: 'buyer@example.com',
              name: 'Buyer',
              status: 'paid',
              premiumCode: null,
            },
          ],
        };
      }

      if (sql.includes('FROM premium_codes') && sql.includes("status = 'available'")) {
        return { rowCount: 0, rows: [] };
      }

      if (sql.includes("premium_code_error = 'NO_CODES_AVAILABLE'")) {
        errorRecorded = true;
        return { rowCount: 1, rows: [] };
      }

      return { rowCount: 0, rows: [] };
    },
    release() {},
  };
  const database = { async connect() { return client; } };

  const result = await assignPremiumCodeForPayment('pay_test', database);

  assert.equal(result.premiumCode, null);
  assert.equal(result.codeStatus, 'pending');
  assert.equal(result.noCodesAvailable, true);
  assert.equal(errorRecorded, true);
});
