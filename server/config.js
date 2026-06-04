import 'dotenv/config';

function parseInteger(value, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(value ?? '', 10);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  return parsed;
}

function normalizeUrl(value) {
  return value?.trim().replace(/\/+$/, '') ?? '';
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function getConfig() {
  return {
    databaseUrl: process.env.DATABASE_URL?.trim() ?? '',
    frontendUrl: normalizeUrl(process.env.FRONTEND_URL),
    host: '0.0.0.0',
    initialTotalQuantity: parseInteger(process.env.INITIAL_TOTAL_QUANTITY, 100, {
      min: 0,
      max: 1_000_000,
    }),
    port: parseInteger(process.env.PORT, 3000, { min: 1, max: 65_535 }),
    stripePaymentLink: process.env.STRIPE_PAYMENT_LINK?.trim() ?? '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '',
  };
}

export function assertDatabaseConfig() {
  if (!getConfig().databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
}

export function assertServerConfig() {
  const config = getConfig();
  const missing = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.stripePaymentLink) missing.push('STRIPE_PAYMENT_LINK');
  if (!config.stripeWebhookSecret) missing.push('STRIPE_WEBHOOK_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!isHttpsUrl(config.stripePaymentLink)) {
    throw new Error('STRIPE_PAYMENT_LINK must be a valid HTTPS URL');
  }
}
