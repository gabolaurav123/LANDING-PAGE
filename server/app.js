import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { getConfig, getSafePublicUrl } from './config.js';
import {
  buildPaymentLinkUrl,
  claimPremiumCodeForOrder,
  completePaidPayment,
  createPendingPayment,
  getCounterState,
  getFounderAccessPayment,
  getPaymentStatus,
  normalizeEmail,
  normalizeName,
  recordTrackingEvent,
  ServiceError,
} from './payments.js';
import { verifyStripeSignature } from './stripe-signature.js';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(serverDirectory, '../dist');

function createCorsMiddleware(frontendUrl) {
  if (!frontendUrl) {
    return (_request, _response, next) => next();
  }

  return cors({
    origin(origin, callback) {
      if (!origin || origin.replace(/\/+$/, '') === frontendUrl) {
        callback(null, true);
        return;
      }

      const error = new Error('Origin not allowed');
      error.statusCode = 403;
      callback(error);
    },
  });
}

function validPaymentId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 200;
}

export function createApp() {
  const app = express();
  const config = getConfig();

  app.disable('x-powered-by');
  app.use(createCorsMiddleware(config.frontendUrl));

  // Stripe requires the exact raw request body to verify the webhook signature.
  app.post(
    '/api/stripe-webhook',
    express.raw({ type: 'application/json', limit: '1mb' }),
    async (request, response) => {
      const signatureHeader = request.get('stripe-signature');
      const signatureValid = verifyStripeSignature({
        payload: request.body,
        signatureHeader,
        secret: config.stripeWebhookSecret,
      });

      if (!signatureValid) {
        response.status(400).json({ error: 'Firma de Stripe inválida' });
        return;
      }

      let event;

      try {
        event = JSON.parse(request.body.toString('utf8'));
      } catch {
        response.status(400).json({ error: 'Payload inválido' });
        return;
      }

      if (event.type === 'checkout.session.completed') {
        const result = await completePaidPayment(event.data?.object ?? {});

        if (result.outcome === 'not_found') {
          console.warn('Stripe webhook referenced an unknown payment');
        }

        if (result.outcome === 'paid' && !result.counterIncremented) {
          console.warn('A paid Stripe session arrived after availability reached zero');
        }
      }

      response.status(200).json({ received: true });
    },
  );

  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true, message: 'Backend activo' });
  });

  app.get('/api/counter', async (_request, response) => {
    response.set('Cache-Control', 'no-store');
    response.json(await getCounterState());
  });

  app.post('/api/create-payment', async (request, response) => {
    const email = normalizeEmail(request.body?.email);
    const name = normalizeName(request.body?.name);
    const paymentId = await createPendingPayment({ email, name });
    const url = buildPaymentLinkUrl(config.stripePaymentLink, { paymentId, email });

    response.status(201).json({ paymentId, url });
  });

  app.get('/api/payment-status/:id', async (request, response) => {
    if (!validPaymentId(request.params.id)) {
      response.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    response.set('Cache-Control', 'no-store');
    const payment = await getPaymentStatus(request.params.id);

    if (!payment) {
      response.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    response.json(payment);
  });

  app.post('/api/track-event', async (request, response) => {
    const eventName = typeof request.body?.eventName === 'string' ? request.body.eventName : '';
    const paymentId =
      typeof request.body?.paymentId === 'string' && validPaymentId(request.body.paymentId)
        ? request.body.paymentId
        : null;
    const metadata =
      request.body?.metadata && typeof request.body.metadata === 'object'
        ? request.body.metadata
        : null;

    await recordTrackingEvent(eventName, { paymentId, metadata });
    response.status(202).json({ ok: true });
  });

  const claimPremiumCodeHandler = async (request, response) => {
    const orderId =
      typeof request.body?.order_id === 'string'
        ? request.body.order_id
        : typeof request.body?.orderId === 'string'
          ? request.body.orderId
          : typeof request.body?.paymentId === 'string'
            ? request.body.paymentId
            : '';

    if (!validPaymentId(orderId)) {
      response.status(400).json({
        success: false,
        message: 'Falta el identificador de la orden.',
      });
      return;
    }

    try {
      response.set('Cache-Control', 'no-store');
      const result = await claimPremiumCodeForOrder({
        customerEmail: request.body?.customer_email ?? request.body?.customerEmail,
        customerName: request.body?.customer_name ?? request.body?.customerName,
        orderId,
      });

      if (result.success) {
        response.json({ success: true, code: result.code });
        return;
      }

      response.json({
        success: false,
        message: result.message || 'No hay códigos disponibles en este momento.',
      });
    } catch (error) {
      console.error('Premium code claim failed');
      response.status(500).json({
        success: false,
        message: 'No se pudo entregar el código en este momento.',
      });
    }
  };

  app.post('/api/claim-premium-code', claimPremiumCodeHandler);
  app.post('/api/assign-premium-code', claimPremiumCodeHandler);

  app.get('/api/founder-access/:id', async (request, response) => {
    if (!validPaymentId(request.params.id)) {
      response.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    response.set('Cache-Control', 'no-store');
    const payment = await getFounderAccessPayment(request.params.id);

    if (!payment) {
      response.status(404).json({ error: 'Pago no encontrado' });
      return;
    }

    if (payment.status !== 'paid') {
      response.status(403).json({
        error: 'Contenido disponible solo para pagos confirmados',
      });
      return;
    }

    const contentUrl = getSafePublicUrl(config.founderContentUrl);
    const telegramUrl = getSafePublicUrl(config.telegramBotUrl);

    response.json({
      paymentId: payment.id,
      premiumCode: payment.premiumCode || null,
      premiumCodeAssignedAt: payment.premiumCodeAssignedAt || null,
      premiumCodeError: payment.premiumCodeError || null,
      contentConfigured: Boolean(contentUrl),
      contentUrl: contentUrl || null,
      telegramUrl: telegramUrl || null,
    });
  });

  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Ruta no encontrada' });
  });

  if (existsSync(distDirectory)) {
    app.use(express.static(distDirectory, { index: false }));
    app.use((request, response, next) => {
      if (request.method !== 'GET') {
        next();
        return;
      }

      response.sendFile(path.join(distDirectory, 'index.html'));
    });
  }

  app.use((error, request, response, _next) => {
    const statusCode =
      error instanceof ServiceError
        ? error.statusCode
        : Number.isInteger(error.statusCode)
          ? error.statusCode
          : 500;

    if (statusCode >= 500) {
      console.error(`Request failed: ${request.method} ${request.path}`);
    }

    response.status(statusCode).json({
      error:
        error instanceof ServiceError || statusCode < 500
          ? error.message
          : 'No se pudo procesar la solicitud.',
      ...(error instanceof ServiceError ? { code: error.code } : {}),
    });
  });

  return app;
}
