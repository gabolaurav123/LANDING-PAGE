# Kiryus BioShield Landing Page

Landing full-stack para la preventa de Kiryus BioShield. El frontend usa Vite y React; Express
sirve el build y expone las rutas de pago, webhook y disponibilidad respaldadas por Neon
PostgreSQL.

## Comandos

```bash
npm install
npm run dev
npm run dev:server
npm run build
npm test
npm start
```

En desarrollo, ejecuta `npm run dev:server` y `npm run dev` en terminales separadas. Vite envía
las llamadas `/api` al backend local en el puerto `3000`.

## Variables de entorno

Copia `.env.example` a `.env` solo para desarrollo local. Nunca confirmes `.env` en Git.

```dotenv
DATABASE_URL=
FOUNDER_CONTENT_URL=
STRIPE_PAYMENT_LINK=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=
TELEGRAM_BOT_URL=https://t.me/Kiryusbot
VITE_API_URL=
PORT=3000
INITIAL_TOTAL_QUANTITY=100
```

El servidor crea las tablas y el contador `main` automáticamente al arrancar. También puedes
ejecutar la migración manualmente con `npm run db:migrate`.

## Stripe

Configura el webhook para escuchar únicamente `checkout.session.completed`:

```text
https://web-zfki2flrsauw.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/stripe-webhook
```

En el Payment Link de Stripe, configura el comportamiento posterior al pago para redirigir a:

```text
https://web-zfki2flrsauw.up-de-fra1-k8s-1.apps.run-on-seenode.com/success
```

La página `/success` no confía en la redirección para marcar un pago como completado. Consulta el
estado real guardado por el webhook.

## Contenido Founder

La seccion privada de `/success` aparece solo cuando el pago esta confirmado como `paid`. Para
activar el boton de descarga, agrega en Seenode:

```dotenv
FOUNDER_CONTENT_URL=https://drive.google.com/...
TELEGRAM_BOT_URL=https://t.me/Kiryusbot
```

`FOUNDER_CONTENT_URL` debe apuntar a la carpeta o archivo de Google Drive con la guia digital y los
audios Neurofocus. Si no esta configurado, el usuario pagado vera el bot de Telegram y un aviso de
material digital pendiente.

## Seenode

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: `3000`

Agrega en Seenode todas las variables listadas en `.env.example`. Los secretos de Neon y Stripe
deben existir únicamente en las variables de entorno del Web Service.
