# Deployment Guide

This guide covers deploying Boomerang 🪃 to production.

## Overview

We'll deploy:
- **Backend**: Railway, Render, or any Node.js hosting
- **Frontend**: Vercel (recommended) or Netlify
- **Database**: Neon PostgreSQL (serverless)

## Prerequisites

- [ ] All tests passed on devnet
- [ ] GitHub repository set up
- [ ] Neon account created
- [ ] Railway/Render account created
- [ ] Vercel account created
- [ ] Production Telegram bot created
- [ ] Production Birdeye API key obtained
- [ ] Mainnet RPC URL (Helius, QuickNode, or public)

## Step 1: Database Setup (Neon)

### Create Neon Project

1. Go to https://neon.tech
2. Create new project: "emissionbot-prod"
3. Copy the connection string

### Run Migrations

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your_neon_connection_string"

cd backend
npm run migrate
```

### Verify Tables

Check that all tables were created:
- users
- bot_configs
- execution_logs
- airdrop_transactions

## Step 2: Backend Deployment (Railway)

### Option A: Railway

1. Go to https://railway.app
2. Create new project from GitHub repo
3. Select `backend` as root directory

### Environment Variables

Add these in Railway dashboard:

```env
NODE_ENV=production
PORT=3000

# Database (from Neon)
DATABASE_URL=postgresql://...neon.tech/emissionbot?sslmode=require

# Solana Mainnet
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta

# Telegram
TELEGRAM_BOT_TOKEN=your_production_bot_token

# APIs
BIRDEYE_API_KEY=your_birdeye_key

# Security - Generate new key for production!
MASTER_ENCRYPTION_KEY=generate_new_64_char_hex
```

### Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploy

1. Push to GitHub
2. Railway will auto-deploy
3. Check logs for successful startup

### Option B: Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables (same as above)

## Step 3: Frontend Deployment (Vercel)

### Setup

1. Go to https://vercel.com
2. Import GitHub repository
3. Framework preset: Next.js
4. Root directory: `frontend`

### Environment Variables

Add in Vercel dashboard:

```env
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Deploy

1. Click "Deploy"
2. Vercel will build and deploy
3. Visit your production URL

## Step 4: Configure Telegram Bot

### Create Production Bot

1. Message @BotFather on Telegram
2. Use `/newbot` command
3. Choose name: "EmissionBot" (or your name)
4. Choose username: "your_bot_username"
5. Copy the token

### Set Bot Commands

Send to @BotFather:

```
/setcommands

start - Start the bot
setup - Configure your bot
status - View bot status
pause - Pause bot execution
resume - Resume bot execution
stop - Delete bot configuration
help - Show help message
```

### Set Bot Description

```
/setdescription

Automated PumpFun fee redistribution bot. Claims volume fees, buys tokens, and airdrops to holders.
```

## Step 5: DNS & Domain (Optional)

### Backend Custom Domain

On Railway/Render:
1. Add custom domain
2. Update DNS records
3. Enable SSL/TLS

### Frontend Custom Domain

On Vercel:
1. Add custom domain
2. Update DNS records (automatic SSL)
3. Update `NEXT_PUBLIC_API_URL` if backend has custom domain

## Step 6: Monitoring Setup

### Backend Health Checks

Add uptime monitoring:
- UptimeRobot: https://uptimerobot.com
- Monitor: `https://your-backend.com/api/health`
- Check interval: 5 minutes

### Log Monitoring

Railway/Render provide built-in logs:
- Monitor for errors
- Set up alerts for failures
- Check scheduler execution logs

### Database Monitoring

Neon dashboard shows:
- Active connections
- Query performance
- Storage usage

## Step 7: Security Hardening

### Environment Variables

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] New encryption key generated for production
- [ ] Database uses SSL/TLS

### Rate Limiting (Optional)

Add to `backend/src/api/middleware.js`:

```javascript
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

Apply to API routes in `index.js`:

```javascript
import { limiter } from './api/middleware.js';
app.use('/api', limiter, routes);
```

### CORS Configuration

Update `backend/src/api/middleware.js`:

```javascript
export function cors(req, res, next) {
  const allowedOrigins = [
    'https://your-frontend-domain.vercel.app',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : null
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}
```

## Step 8: Testing Production

### Test Checklist

- [ ] Backend is accessible at production URL
- [ ] Frontend loads correctly
- [ ] Telegram bot responds to `/start`
- [ ] Setup flow works with mainnet addresses
- [ ] Database connections are stable
- [ ] Logs show no errors
- [ ] Health check endpoint returns OK
- [ ] Stats API returns data
- [ ] Scheduler is running

### First Production Run

1. Use a test wallet with small amount of SOL
2. Set up bot with 60-minute interval
3. Monitor first execution closely
4. Check all logs for errors
5. Verify airdrop transactions on Solscan
6. Check Telegram notifications

## Step 9: Maintenance

### Regular Checks

- Monitor bot execution logs
- Check database storage usage
- Review error rates
- Monitor API rate limits (Birdeye, Jupiter)
- Check RPC performance

### Backups

Neon provides automatic backups, but also:
- Export important data regularly
- Keep encrypted backup of encryption key (securely!)
- Document all configuration

### Updates

When updating code:

```bash
# Test on devnet first
git checkout develop
# Make changes and test
git push

# Deploy to production
git checkout main
git merge develop
git push
```

Railway/Render will auto-deploy on push.

## Scaling Considerations

### When to Scale

- More than 100 active bots
- High database query load
- RPC rate limiting issues
- Slow transaction processing

### Scaling Options

1. **Database**: Upgrade Neon tier for more connections
2. **RPC**: Use paid RPC (Helius, QuickNode) for better performance
3. **Backend**: Increase Railway/Render instance size
4. **Caching**: Add Redis for holder data caching
5. **Queue**: Use BullMQ for transaction queue management

## Cost Estimates

### Free Tier (Testing)

- Railway: Free 500 hours/month
- Neon: Free 0.5 GB storage
- Vercel: Free for hobby projects
- **Total: $0/month**

### Production (Low Volume)

- Railway: ~$5-10/month
- Neon: ~$0-5/month (usage-based)
- Vercel: Free
- Birdeye API: Free tier
- Helius RPC: $0-49/month
- **Total: ~$10-64/month**

### Production (High Volume)

- Railway: ~$20-50/month
- Neon: ~$10-20/month
- Vercel: Free
- Birdeye API: $99-299/month
- Helius RPC: $99-499/month
- **Total: ~$228-868/month**

## Rollback Plan

If issues occur:

1. Pause all bots via database:
```sql
UPDATE bot_configs SET is_active = false;
```

2. Stop backend service temporarily

3. Investigate logs and fix issues

4. Test fix on devnet

5. Redeploy and re-enable bots

## Support & Monitoring

### Error Notifications

Set up error notifications:
- Email alerts for critical errors
- Telegram channel for execution failures
- Discord webhook for status updates

### Status Page (Optional)

Create a simple status page showing:
- Backend status
- Database status
- Last successful execution
- Total bots running

## Final Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database migrations completed
- [ ] Telegram bot token is for production bot
- [ ] Mainnet RPC URL configured
- [ ] New encryption key generated
- [ ] SSL/TLS enabled everywhere
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Emergency contacts listed
- [ ] Tested with small amounts first

## Conclusion

Your EmissionBot is now deployed! Monitor the first few days closely and be ready to make adjustments based on real-world usage.

For issues or questions, check logs first, then review this documentation.

Good luck! 🚀
