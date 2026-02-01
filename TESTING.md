# Testing Guide

This guide will help you test Boomerang 🪃 on Solana devnet before deploying to mainnet.

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database (Neon or local)
3. Telegram Bot Token (from @BotFather)
4. Birdeye API Key
5. Solana devnet wallet with SOL for testing

## Environment Setup

### Backend Environment

1. Copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

2. Fill in your `.env` file:
```env
NODE_ENV=development
PORT=3000

# Use Neon free tier or local PostgreSQL
DATABASE_URL=postgresql://user:pass@your-db-host/emissionbot?sslmode=require

# Use devnet for testing
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Get from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Get from Birdeye (free tier available)
BIRDEYE_API_KEY=your_birdeye_key

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MASTER_ENCRYPTION_KEY=your_64_character_hex_string
```

### Frontend Environment

1. Copy `.env.example` to `.env.local`:
```bash
cd frontend
cp .env.example .env.local
```

2. Fill in your `.env.local`:
```env
NEXT_PUBLIC_BOT_USERNAME=your_bot_username
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Database Setup

Run migrations to create tables:

```bash
cd backend
npm run migrate
```

You should see:
```
✅ Created users table
✅ Created bot_configs table
✅ Created execution_logs table
✅ Created airdrop_transactions table
✅ Created indexes
🎉 Migration completed successfully!
```

## Testing Steps

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Starting EmissionBot...
   Environment: development
   Solana Network: devnet
📊 Testing database connection...
✅ Database connected
🤖 Starting Telegram bot...
✅ Telegram bot initialized
✅ Telegram bot started
⏰ Starting scheduler...
   Found 0 active configurations
✅ Scheduler initialized successfully
✅ API server listening on port 3000

🎉 EmissionBot is running!
```

### 2. Start the Frontend (Optional)

In a new terminal:

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3001` to see the landing page.

### 3. Test Telegram Bot

1. Open Telegram and find your bot
2. Send `/start` - you should see the welcome message
3. Send `/help` - you should see the help menu

### 4. Test Setup Flow

**Important:** For devnet testing, you need:
- A devnet wallet with SOL (get from https://faucet.solana.com)
- A test PumpFun token on devnet (or any SPL token)
- A target token address (can use SOL: `So11111111111111111111111111111111111111112`)

1. Send `/setup` to your bot
2. Provide your **devnet** wallet private key
3. Enter your source token address (PumpFun token)
4. Enter target token address (token to buy & airdrop)
5. Select an interval (suggest 10 minutes for testing)
6. Confirm the configuration

### 5. Monitor Execution

Use `/status` command to check:
- Bot configuration
- Last execution status
- SOL claimed
- Holders airdropped to

Check backend logs for detailed execution flow:
```
🚀 Executing bot for config ID: 1
🔐 Decrypting private key...
💰 Checking available creator fees...
...
```

### 6. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Scheduler status
curl http://localhost:3000/api/status

# Public stats
curl http://localhost:3000/api/stats
```

### 7. Test Bot Commands

- `/pause` - Should pause the bot
- `/resume` - Should resume the bot
- `/status` - Should show updated status
- `/stop` - Should delete the configuration

## Testing Checklist

- [ ] Database connection works
- [ ] Telegram bot responds to commands
- [ ] Setup flow completes successfully
- [ ] Private key is encrypted in database
- [ ] Scheduler creates cron job for config
- [ ] Bot attempts execution at interval
- [ ] PumpFun fee check works (may be 0 on devnet)
- [ ] Jupiter swap integration works
- [ ] Birdeye API returns holder data
- [ ] Airdrop batching works correctly
- [ ] Execution logs are saved
- [ ] Telegram notifications are sent
- [ ] `/pause` and `/resume` work
- [ ] `/status` shows correct information
- [ ] `/stop` deletes configuration
- [ ] API endpoints return correct data
- [ ] Frontend displays stats correctly

## Common Issues

### Issue: "Invalid private key format"
- Ensure you're using a valid Solana private key
- Accepted formats: base58 string or JSON array [1,2,3...]

### Issue: "No fees to claim"
- This is normal on devnet if you haven't had any PumpFun trades
- The bot will skip execution and log this

### Issue: "Failed to fetch token holders"
- Check your Birdeye API key is valid
- Ensure the token address exists and has holders
- Birdeye may have limited devnet support

### Issue: "Insufficient SOL for transaction"
- Ensure your devnet wallet has enough SOL
- Get more from https://faucet.solana.com

### Issue: "Database connection error"
- Verify DATABASE_URL is correct
- Check if database is accessible
- Ensure migrations were run

## Devnet vs Mainnet Differences

**Devnet:**
- Free SOL from faucet
- May have fewer tokens available
- PumpFun may not have devnet deployment
- Birdeye may have limited data
- Jupiter may have fewer routes

**Mainnet:**
- Real SOL and tokens
- Full PumpFun integration
- Complete Birdeye data
- All Jupiter routes available
- Real transaction costs

## Manual Testing of Individual Services

### Test Encryption Service

```javascript
import { encryptPrivateKey, decryptPrivateKey } from './src/services/encryption.js';

const testKey = 'your_test_private_key';
const encrypted = encryptPrivateKey(testKey);
console.log('Encrypted:', encrypted);

const decrypted = decryptPrivateKey(encrypted);
console.log('Decrypted matches:', decrypted === testKey);
```

### Test Database Queries

```javascript
import * as db from './src/db/queries.js';

// Create test user
const user = await db.createOrGetUser(123456, 'testuser');
console.log('User:', user);

// Get active configs
const configs = await db.getActiveBotConfigs();
console.log('Active configs:', configs);
```

## Next Steps

Once all tests pass on devnet:

1. Review all code for security issues
2. Update `.env` with mainnet values:
   - Change `SOLANA_RPC_URL` to mainnet
   - Change `SOLANA_NETWORK` to mainnet-beta
3. Deploy to production (see DEPLOYMENT.md)
4. Monitor first few executions closely
5. Set up proper monitoring and alerts

## Security Reminders

- ⚠️ Never commit `.env` files
- ⚠️ Never share private keys
- ⚠️ Always test on devnet first
- ⚠️ Keep your encryption key secure
- ⚠️ Use environment variables in production
- ⚠️ Enable SSL/TLS for database connections
- ⚠️ Monitor for suspicious activity
