# Production Deployment & Infrastructure Guide

## Docker / Production Deployment

### 1. Environment Secrets Setup
Configure environment secrets in production (Vercel, AWS ECS, Railway, DigitalOcean App Platform, Docker Container):

```env
DATABASE_URL="postgresql://user:password@postgres-host:5432/whatsapp_os"
AUTH_SECRET="your-production-jwt-secret-min-32-chars"
AI_PROVIDER="openai"
AI_PROVIDER_API_KEY="sk-proj-your-production-openai-api-key"
AI_MODEL="gpt-4o-mini"

WHATSAPP_PROVIDER="meta"
WHATSAPP_ACCESS_TOKEN="EAAB..."
WHATSAPP_PHONE_NUMBER_ID="1092837465991"
WHATSAPP_BUSINESS_ACCOUNT_ID="9876543210"
WHATSAPP_VERIFY_TOKEN="your_secure_verify_token"
WHATSAPP_APP_SECRET="your_meta_app_secret"
```

### 2. Database Migration Command
```bash
npx prisma db push
```

### 3. Build & Run Command
```bash
npm run build
npm start
```
