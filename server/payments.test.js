import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPaymentLinkUrl,
  claimPremiumCodeForOrder,
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

test('claimPremiumCodeForOrder records a BIOSHIELD code delivery without marking it used', async () => {
  let premiumCodeUpdated = false;
  let deliveryInserted = false;
  let eventInserted = false;

  const client = {
    async query(sql, params) {
      if (sql.includes('FROM landing_code_deliveries') && sql.includes('WHERE order_id')) {
        assert.deepEqual(params, ['pay_test']);
        return { rowCount: 0, rows: [] };
      }

      if (sql.includes('FROM payments') && sql.includes('WHERE id = $1')) {
        assert.deepEqual(params, ['pay_test']);
        return {
          rowCount: 1,
          rows: [
            {
              id: 'pay_test',
              email: 'buyer@example.com',
              name: 'Buyer',
              status: 'paid',
            },
          ],
        };
      }

      if (sql.trimStart().startsWith('UPDATE') && sql.includes('premium_codes')) {
        premiumCodeUpdated = true;
        return { rowCount: 1, rows: [] };
      }

      if (sql.includes('INSERT INTO landing_code_deliveries')) {
        deliveryInserted = true;
        assert.deepEqual(params, ['buyer@example.com', 'Buyer', 'pay_test']);
        assert.ok(sql.includes("pc.code LIKE 'BIOSHIELD-%'"));
        assert.ok(sql.includes("pc.status = 'available'"));
        return { rowCount: 1, rows: [{ code: 'BIOSHIELD-2710' }] };
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

  const result = await claimPremiumCodeForOrder(
    {
      customerEmail: 'buyer@example.com',
      customerName: 'Buyer',
      orderId: 'pay_test',
    },
    database,
  );

  assert.deepEqual(result, { success: true, code: 'BIOSHIELD-2710' });
  assert.equal(deliveryInserted, true);
  assert.equal(eventInserted, true);
  assert.equal(premiumCodeUpdated, false);
});

test('claimPremiumCodeForOrder returns an existing delivery for the same order id', async () => {
  let codeQueried = false;

  const client = {
    async query(sql, params) {
      if (sql.includes('FROM landing_code_deliveries') && sql.includes('WHERE order_id')) {
        assert.deepEqual(params, ['pay_test']);
        return { rowCount: 1, rows: [{ code: 'BIOSHIELD-2710' }] };
      }

      if (sql.includes('FROM premium_codes')) {
        codeQueried = true;
      }

      return { rowCount: 0, rows: [] };
    },
    release() {},
  };
  const database = { async connect() { return client; } };

  assert.deepEqual(
    await claimPremiumCodeForOrder(
      { customerEmail: 'buyer@example.com', customerName: 'Buyer', orderId: 'pay_test' },
      database,
    ),
    { success: true, code: 'BIOSHIELD-2710', alreadyDelivered: true },
  );
  assert.equal(codeQueried, false);
});

test('claimPremiumCodeForOrder returns false when no BIOSHIELD codes are available', async () => {
  let errorRecorded = false;

  const client = {
    async query(sql, params) {
      if (sql.includes('FROM landing_code_deliveries') && sql.includes('WHERE order_id')) {
        assert.deepEqual(params, ['pay_test']);
        return { rowCount: 0, rows: [] };
      }

      if (sql.includes('FROM payments') && sql.includes('WHERE id = $1')) {
        assert.deepEqual(params, ['pay_test']);
        return {
          rowCount: 1,
          rows: [
            {
              id: 'pay_test',
              email: 'buyer@example.com',
              name: 'Buyer',
              status: 'paid',
            },
          ],
        };
      }

      if (sql.includes('INSERT INTO landing_code_deliveries')) {
        return { rowCount: 0, rows: [] };
      }

      if (sql.includes('INSERT INTO tracking_events')) {
        errorRecorded = true;
        return { rowCount: 1, rows: [] };
      }

      return { rowCount: 0, rows: [] };
    },
    release() {},
  };
  const database = { async connect() { return client; } };

  const result = await claimPremiumCodeForOrder(
    { customerEmail: 'buyer@example.com', customerName: 'Buyer', orderId: 'pay_test' },
    database,
  );

  assert.deepEqual(result, {
    success: false,
    message: 'No hay códigos disponibles en este momento.',
  });
  assert.equal(errorRecorded, true);
});
