# Public Token Dashboard Feature 🪃

## Overview

Every token that uses Boomerang gets its own **public dashboard** showing live fee redistribution stats!

## URL Structure

```
boomerang.com/[token-contract-address]

Example:
boomerang.com/Hfp9k2L3wM8vN4qR5tS6uV7xW8yZ9aB1cD2eF3gH4i
```

## Dashboard Features

### 📊 Live Statistics

**Main Stats Cards:**
- 💰 **Total SOL Claimed** - All fees claimed from PumpFun
- 🔄 **Total Bought Back** - Total tokens purchased with fees
- 🎁 **Total Airdropped** - Total tokens distributed to holders
- 📈 **Total Executions** - Number of successful distribution runs

### 🏆 Top Recipients Table

Shows the top 10 wallets by:
- Total tokens received
- Number of airdrops received
- Wallet address (shortened for privacy)

### 📈 Recent Executions Timeline

Last 10 executions showing:
- Execution timestamp
- SOL claimed
- Tokens bought
- Tokens airdropped
- Number of holders reached
- Success/failure status

### 🎨 Design

**Color Scheme:**
- Light blue background (sky blue #87CEEB)
- Orange accents (#FF8C42) from boomerang logo
- White/transparent cards with backdrop blur
- Clean, modern, transparent design

**Layout:**
```
┌─────────────────────────────────────────┐
│  🪃 Boomerang          🟢 Live          │
├─────────────────────────────────────────┤
│                                         │
│     💎 Source → 🎯 Target              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │Stats│  │Stats│  │Stats│  │Stats│  │
│  └─────┘  └─────┘  └─────┘  └─────┘  │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │Top Recipients│  │Recent Execs  │   │
│  │   Table      │  │   Timeline   │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Details

### Backend API Endpoint

**GET** `/api/dashboard/:tokenAddress`

Returns:
```json
{
  "sourceToken": {
    "address": "ABC123..."
  },
  "targetToken": {
    "address": "XYZ789..."
  },
  "stats": {
    "totalAirdropped": "1234567890",
    "totalBoughtBack": "9876543210",
    "totalSolClaimed": "5000000000",
    "totalExecutions": 42,
    "lastExecution": "2026-01-26T12:00:00Z"
  },
  "topRecipients": [
    {
      "address": "holder1...",
      "totalReceived": "123456",
      "airdropCount": 10
    }
  ],
  "recentExecutions": [
    {
      "id": 1,
      "claimedSol": "100000000",
      "boughtTokens": "50000",
      "totalAirdropped": "50000",
      "holderCount": 25,
      "executionTime": "2026-01-26T12:00:00Z",
      "status": "success"
    }
  ],
  "config": {
    "intervalMinutes": 30,
    "isActive": true
  }
}
```

### Frontend Dynamic Route

**File:** `frontend/app/[tokenAddress]/page.js`

- Next.js dynamic route
- Auto-polling every 30 seconds
- Responsive design
- Live update indicator

### Database Queries Added

1. `getBotConfigBySourceToken(tokenAddress)` - Get config for token
2. `getTokenStats(tokenAddress)` - Aggregate statistics
3. `getTopRecipients(tokenAddress, limit)` - Top 10 recipients
4. `getRecentExecutions(tokenAddress, limit)` - Last 10 executions

## Usage

### For Token Creators

1. Set up Boomerang bot via Telegram
2. Share your dashboard link: `boomerang.com/YOUR_TOKEN_ADDRESS`
3. Anyone can view your transparent fee distribution

### For Community/Holders

1. Visit the dashboard URL
2. See live stats updating every 30 seconds
3. Check if you're in the top recipients
4. View recent distribution history

## Benefits

✅ **Transparency** - Public proof of fee redistribution
✅ **Marketing** - Show commitment to holders
✅ **Trust Building** - Verifiable on-chain data
✅ **Community** - Holders can track their rewards

## Technical Notes

### Live Updates

- Polling every 30 seconds
- Shows "🟢 Live" indicator in header
- Last updated timestamp displayed

### Performance

- Cached queries for efficiency
- Indexed database tables
- Minimal API calls

### Privacy

- Public by default (no authentication)
- Shows wallet addresses (public blockchain data)
- No sensitive information exposed

## Future Enhancements

Potential additions:
- 📊 Charts/graphs of distribution over time
- 🎨 Custom token branding (colors, logo)
- 💬 Social links integration
- 📱 Mobile-optimized view
- 🔗 Solscan transaction links
- 📤 Share to Twitter button

## Testing

Test the dashboard:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Set up a test token via Telegram bot
4. Visit: `http://localhost:3001/YOUR_TOKEN_ADDRESS`
5. Should see dashboard with stats

## Production

When deployed:
- Backend at: `boomerang.com` (or API subdomain)
- Frontend at: `boomerang.com`
- Dashboard at: `boomerang.com/[token-address]`

All dashboards are SEO-friendly and shareable! 🚀
