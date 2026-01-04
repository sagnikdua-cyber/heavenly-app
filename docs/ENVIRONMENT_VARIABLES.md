# Environment Variables Configuration Guide

This document lists all required environment variables for the Heavenly application.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"

# xAI Grok API (for AI chat responses)
XAI_API_KEY="your-xai-api-key-here"

# Resend Email Service (for emergency alerts)
RESEND_API_KEY="your-resend-api-key-here"

# Email Server Key (reference to Resend)
EMAIL_SERVER_KEY=$RESEND_API_KEY
```

## How to Obtain API Keys

### 1. xAI Grok API Key
- Visit: https://x.ai
- Sign up for an account
- Navigate to API settings
- Generate a new API key
- Copy and paste into `XAI_API_KEY`

### 2. Resend API Key
- Visit: https://resend.com
- Create an account
- Go to API Keys section
- Create a new API key
- Copy and paste into `RESEND_API_KEY`

### 3. NextAuth Secret
- Generate a secure random string (minimum 32 characters)
- You can use: `openssl rand -base64 32`
- Or visit: https://generate-secret.vercel.app/32

## Current Implementation Status

All API keys are properly configured using environment variables:

✅ **Grok API** (`app/api/chat/grok/route.ts`):
```typescript
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});
```

✅ **Resend Email** (`app/api/safety-alert/route.ts`):
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

✅ **Emergency Alert** (`app/api/emergency/alert/route.ts`):
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Keep keys confidential** - Never share in public repositories
5. **Use environment-specific files**:
   - `.env.local` - Local development (gitignored)
   - `.env.production` - Production deployment

## Verification

To verify your environment variables are loaded:
1. Check the terminal output when starting the dev server
2. Look for any "undefined" errors in API routes
3. Test the chatroom - if Grok responds, XAI_API_KEY is working
4. Trigger a crisis alert - if emails send, RESEND_API_KEY is working

## Troubleshooting

**Issue**: "API key is undefined"
- **Solution**: Restart the dev server after adding keys to `.env.local`

**Issue**: "Grok API not responding"
- **Solution**: Verify XAI_API_KEY is valid and has sufficient credits

**Issue**: "Emails not sending"
- **Solution**: Check RESEND_API_KEY and verify domain is configured in Resend dashboard

## No Hardcoded Keys

✅ All API keys are securely stored in environment variables
✅ No hardcoded credentials in the codebase
✅ All sensitive data properly gitignored
