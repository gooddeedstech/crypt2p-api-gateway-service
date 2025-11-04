# API Gateway (RMQ)

NestJS API Gateway for Validation microservice via RabbitMQ.

## Features
- RMQ transport (durable queue)
- Global validation pipe
- API key guard (`x-api-key`)
- Logging interceptor
- Exception filter (maps RPC/HTTP → clean JSON)
- Swagger (`/docs` when `SWAGGER_ENABLED=true`)
- Health checks

## Env
Copy `.env.example` to `.env` and edit:

```
API_PORT=3000
API_KEY=change-me
RABBITMQ_URL=amqp://user:password@10.2.252.69:5672
VALIDATION_QUEUE=validation_queue
SWAGGER_ENABLED=true
```

## Install & Run
```bash
npm i
npm run start:dev
```

## Routes
- `GET /validation/banks?country=nigeria`
- `GET /validation/account/resolve?bankCode=058&accountNumber=0123456789`
- `POST /validation/bvn/verify` → `{ "bvn": "...", "accountNumber": "...", "bankCode": "..." }`
- `GET /health` / `GET /health/validation`

All requests require header: `x-api-key: <API_KEY>` (if set).
