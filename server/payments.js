import { randomUUID } from 'node:crypto';
import { getPool } from './db.js';

const COUNTER_KEY = 'main';

export class ServiceError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function normalizeEmail(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.length > 320 || !emailPattern.test(email)) {
    throw new ServiceError('Ingresa un correo electrónico válido.', 400, 'INVALID_EMAIL');
  }

  return email;
}

export function normalizeName(value) {
  const name = typeof value === 'string' ? value.trim() : '';

  if (name.length > 120) {
    throw new ServiceError('El nombre es demasiado largo.', 400, 'INVALID_NAME');
  }

  return name || null;
}

export function buildPaymentLinkUrl(paymentLink, { paymentId, email }) {
  let url;

  try {
    url = new URL(paymentLink);
  } catch {
    throw new ServiceError('El enlace de pago no está configurado correctamente.', 503, 'PAYMENT_CONFIG');
  }

  if (url.protocol !== 'https:') {
    throw new ServiceError('El enlace de pago no está configurado correctamente.', 503, 'PAYMENT_CONFIG');
  }

  url.searchParams.set('client_reference_id', paymentId);
  url.searchParams.set('prefilled_email', email);
  return url.toString();
}

export async function getCounterState(database = getPool()) {
  const result = await database.query(
    `SELECT
       counter_key AS "counterKey",
       total_quantity AS "totalQuantity",
       sold_count AS "soldCount",
       GREATEST(total_quantity - sold_count, 0) AS "remainingCount"
     FROM campaign_counters
     WHERE counter_key = $1`,
    [COUNTER_KEY],
  );

  if (result.rowCount === 0) {
    throw new ServiceError('El contador no está disponible.', 503, 'COUNTER_NOT_FOUND');
  }

  return result.rows[0];
}

export async function createPendingPayment({ email, name }, database = getPool()) {
  const client = await database.connect();

  try {
    await client.query('BEGIN');
    const counter = await client.query(
      `SELECT total_quantity, sold_count
       FROM campaign_counters
       WHERE counter_key = $1
       FOR SHARE`,
      [COUNTER_KEY],
    );

    if (counter.rowCount === 0) {
      throw new ServiceError('El contador no está disponible.', 503, 'COUNTER_NOT_FOUND');
    }

    const { total_quantity: totalQuantity, sold_count: soldCount } = counter.rows[0];

    if (soldCount >= totalQuantity) {
      throw new ServiceError('Actualmente no hay cupos disponibles.', 409, 'SOLD_OUT');
    }

    const paymentId = `pay_${randomUUID()}`;

    await client.query(
      `INSERT INTO payments (id, email, name, status, counter_key)
       VALUES ($1, $2, $3, 'pending', $4)`,
      [paymentId, email, name, COUNTER_KEY],
    );

    await client.query('COMMIT');
    return paymentId;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // The original database error is more useful than a rollback failure.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getPaymentStatus(paymentId, database = getPool()) {
  const result = await database.query(
    `SELECT id, email, name, status, paid_at AS "paid_at"
     FROM payments
     WHERE id = $1`,
    [paymentId],
  );

  return result.rows[0] ?? null;
}

function getStripeId(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value.id === 'string') return value.id;
  return null;
}

export async function completePaidPayment(session, database = getPool()) {
  const paymentId = session.client_reference_id;

  if (!paymentId || session.payment_status !== 'paid') {
    return { outcome: 'ignored' };
  }

  const client = await database.connect();

  try {
    await client.query('BEGIN');
    const paymentResult = await client.query(
      `SELECT id, status, counter_key
       FROM payments
       WHERE id = $1
       FOR UPDATE`,
      [paymentId],
    );

    if (paymentResult.rowCount === 0) {
      await client.query('COMMIT');
      return { outcome: 'not_found' };
    }

    const payment = paymentResult.rows[0];

    if (payment.status === 'paid') {
      await client.query('COMMIT');
      return { outcome: 'already_paid' };
    }

    const counterResult = await client.query(
      `UPDATE campaign_counters
       SET sold_count = sold_count + 1, updated_at = NOW()
       WHERE counter_key = $1 AND sold_count < total_quantity
       RETURNING sold_count, total_quantity`,
      [payment.counter_key],
    );

    await client.query(
      `UPDATE payments
       SET
         status = 'paid',
         stripe_session_id = $2,
         stripe_payment_intent = $3,
         amount_total = $4,
         currency = $5,
         email = COALESCE($6, email),
         paid_at = NOW()
       WHERE id = $1`,
      [
        paymentId,
        getStripeId(session.id),
        getStripeId(session.payment_intent),
        Number.isInteger(session.amount_total) ? session.amount_total : null,
        typeof session.currency === 'string' ? session.currency : null,
        typeof session.customer_details?.email === 'string'
          ? session.customer_details.email.trim().toLowerCase()
          : null,
      ],
    );

    await client.query('COMMIT');
    return {
      outcome: 'paid',
      counterIncremented: counterResult.rowCount === 1,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // The original database error is more useful than a rollback failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
