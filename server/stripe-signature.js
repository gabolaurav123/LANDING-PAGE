import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_TOLERANCE_SECONDS = 300;

function safeCompare(expected, received) {
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function verifyStripeSignature({
  payload,
  signatureHeader,
  secret,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  now = Math.floor(Date.now() / 1000),
}) {
  if (!payload || !signatureHeader || !secret) return false;

  const values = signatureHeader.split(',').reduce(
    (result, part) => {
      const [key, value] = part.split('=', 2);

      if (key === 't') result.timestamp = value;
      if (key === 'v1' && value) result.signatures.push(value);
      return result;
    },
    { timestamp: '', signatures: [] },
  );

  const timestamp = Number.parseInt(values.timestamp, 10);

  if (!Number.isInteger(timestamp) || values.signatures.length === 0) return false;
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;

  const rawPayload = Buffer.isBuffer(payload) ? payload.toString('utf8') : String(payload);
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawPayload}`, 'utf8')
    .digest('hex');

  return values.signatures.some((signature) => safeCompare(expected, signature));
}
