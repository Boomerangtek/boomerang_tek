# Quick Start Guide

Get Boomerang 🪃 running in under 10 minutes! Your fees always come back!

## What You Need

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL Database** - [Get free Neon account](https://neon.tech)
3. **Telegram Bot Token** - Message [@BotFather](https://t.me/botfather)
4. **Birdeye API Key** - [Sign up here](https://birdeye.so)

## 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

## 2. Configure Environment

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Generate this: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MASTER_ENCRYPTION_KEY=your_64_character_hex_key_here

# Get from Neon.tech
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/emissionbot?sslmode=require

# Get from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Get from Birdeye (free tier available)
BIRDEYE_API_KEY=your_birdeye_api_key

# Start with devnet for testing
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Your bot username (without @)
NEXT_PUBLIC_BOT_USERNAME=your_bot_username

# Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 3. Set Up Database

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
🎉 Migration completed successfully!
```

## 4. Start the Bot

### Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Starting EmissionBot...
✅ Database connected
✅ Telegram bot started
✅ Scheduler started
✅ API server listening on port 3000
🎉 EmissionBot is running!
```

### Frontend (Optional)

```bash
cd frontend
npm run dev
```

Visit http://localhost:3001

## 5. Test the Bot

1. Open Telegram
2. Find your bot (search for the username you set)
3. Send `/start`
4. You should see the welcome message!

## Next Steps

### For Testing (Devnet)

1. Get devnet SOL: https://faucet.solana.com
2. Use `/setup` in Telegram
3. Provide devnet wallet private key
4. Enter test token addresses
5. Choose 10-minute interval for testing
6. Monitor with `/status` command

### For Production (Mainnet)

1. **First:** Complete all devnet testing
2. **Then:** Read [DEPLOYMENT.md](DEPLOYMENT.md)
3. Update `.env` with mainnet RPC
4. Deploy to Railway/Render
5. Deploy frontend to Vercel
6. Start with small amounts!

## Common Commands

```bash
# Backend
npm run dev      # Development with auto-reload
npm start        # Production
npm run migrate  # Run database migrations

# Frontend
npm run dev      # Development server
npm run build    # Build for production
npm start        # Start production server
```

## Telegram Bot Commands

- `/start` - Welcome message
- `/setup` - Configure new bot
- `/status` - Check bot status
- `/pause` - Pause execution
- `/resume` - Resume execution
- `/stop` - Delete configuration
- `/help` - Show help

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Ensure database exists
- Run migrations: `npm run migrate`

### "Telegram bot not responding"
- Verify TELEGRAM_BOT_TOKEN is correct
- Check bot is running (backend should be started)
- Try `/start` command

### "Module not found"
- Run `npm install` in backend directory
- Check Node.js version: `node --version` (need 18+)

### "Invalid private key"
- Use base58 format or JSON array
- Ensure it's a valid Solana private key
- Test on devnet first

## Getting Help

1. Check [TESTING.md](TESTING.md) for detailed testing guide
2. Review [SECURITY.md](SECURITY.md) for security best practices
3. Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
4. Check logs in terminal for error messages

## Architecture Overview

```
┌─────────────┐
│   Telegram  │ ← User interacts via Telegram
│     Bot     │
└──────┬──────┘
       │
┌──────▼───────────────────────┐
│    Backend (Node.js)         │
│  ┌──────────────────────┐    │
│  │  Scheduler (Cron)    │    │ ← Runs on interval
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │  Executor            │    │ ← Main logic
│  │  - Claim fees        │    │
│  │  - Swap SOL          │    │
│  │  - Get holders       │    │
│  │  - Airdrop tokens    │    │
│  └──────────────────────┘    │
└──────┬───────────────────────┘
       │
┌──────▼──────┐
│  PostgreSQL │ ← Encrypted storage
│   Database  │
└─────────────┘
```

## Key Features

- ✅ Automatic PumpFun fee claiming
- ✅ Jupiter aggregator integration for best swap prices
- ✅ Real-time holder data from Birdeye
- ✅ Proportional token distribution
- ✅ AES-256 encrypted private key storage
- ✅ Customizable execution intervals (1-60 minutes)
- ✅ Detailed execution logging
- ✅ Telegram notifications
- ✅ Beautiful landing page

## Project Structure

```
emissionbot/
├── backend/           # Node.js backend
│   └── src/
│       ├── bot/       # Telegram bot
│       ├── services/  # Core services
│       ├── scheduler/ # Cron scheduler
│       ├── db/        # Database
│       └── api/       # REST API
├── frontend/          # Next.js frontend
│   ├── app/          # Pages
│   └── components/   # React components
├── README.md         # Project overview
├── TESTING.md        # Testing guide
├── DEPLOYMENT.md     # Deployment guide
├── SECURITY.md       # Security guide
└── QUICKSTART.md     # This file!
```

## Success Checklist

- [ ] Backend running without errors
- [ ] Database migrations completed
- [ ] Telegram bot responding
- [ ] Can complete `/setup` flow
- [ ] Bot shows in `/status` command
- [ ] Scheduler creates cron job
- [ ] Frontend loads (optional)
- [ ] All tests pass on devnet

Once all checked, you're ready to test! ✅

## Important Reminders

⚠️ **Security**
- Never commit `.env` files
- Never share private keys
- Test on devnet first
- Use strong encryption keys

⚠️ **Testing**
- Always test on devnet before mainnet
- Start with small amounts
- Monitor first executions closely

⚠️ **Production**
- Read DEPLOYMENT.md before deploying
- Set up monitoring and alerts
- Keep dependencies updated
- Have a rollback plan

---

**Ready to launch? Start with step 1 above!** 🚀

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).
