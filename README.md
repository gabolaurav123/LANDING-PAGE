# BioShield by KIRYUS Landing Page

Landing full-stack para la preventa de BioShield by KIRYUS. El frontend usa Vite y React; Express
sirve el build y expone las rutas de pago, webhook, contador de disponibilidad y codigos premium
respaldadas por Neon PostgreSQL.

## Comandos

```bash
npm install
npm run dev
npm run dev:server
npm run build
npm test
npm start
```

En desarrollo, ejecuta `npm run dev:server` y `npm run dev` en terminales separadas. Vite envia las
llamadas `/api` al backend local en el puerto `3000`.

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
VITE_TELEGRAM_BOT_URL=https://t.me/Kiryusbot
PORT=3000
INITIAL_TOTAL_QUANTITY=100
```

El servidor crea las tablas y el contador `main` automaticamente al arrancar. Tambien puedes ejecutar
la migracion manualmente con `npm run db:migrate`.

## Stripe

Configura el webhook para escuchar unicamente `checkout.session.completed`:

```text
https://web-zfki2flrsauw.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/stripe-webhook
```

En el Payment Link de Stripe, configura el comportamiento posterior al pago para redirigir a:

```text
https://web-zfki2flrsauw.up-de-fra1-k8s-1.apps.run-on-seenode.com/success
```

La pagina `/success` no confia en la redireccion para marcar un pago como completado. Consulta el
estado real guardado por el webhook.

## Codigos premium

Los codigos premium se guardan en la tabla `premium_codes`. No deben ponerse en React, HTML ni en
archivos publicos. Para cargar codigos nuevos, insertalos en Neon con formato `BIOSHIELD-####` y
`status = 'available'`.

La landing no marca codigos como `used` ni cambia `premium_codes.status`. Cuando un pago confirmado
solicita su acceso premium, el backend toma el siguiente codigo `BIOSHIELD-%` disponible y registra
la entrega en `landing_code_deliveries`. Si el mismo `order_id` vuelve a solicitar codigo, recibe el
mismo codigo.

El bot de Telegram es quien debe cambiar `premium_codes.status` a `used` cuando el usuario activa el
codigo. Si no quedan codigos disponibles, el comprador ve un mensaje de soporte en Telegram y el
evento `premium_code_error` queda registrado para revision.

## Contenido digital

La seccion privada de `/success` aparece solo cuando el pago esta confirmado como `paid`. En ese
momento el backend entrega un codigo registrado en `landing_code_deliveries` y lo muestra al comprador. Si tambien quieres
mostrar una carpeta de Google Drive con guia digital y audios Neurofocus, agrega:

```dotenv
FOUNDER_CONTENT_URL=https://drive.google.com/...
TELEGRAM_BOT_URL=https://t.me/Kiryusbot
VITE_TELEGRAM_BOT_URL=https://t.me/Kiryusbot
```

## Seenode

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: `3000`

Agrega en Seenode todas las variables listadas en `.env.example`. Los secretos de Neon y Stripe
deben existir unicamente en las variables de entorno del Web Service.
