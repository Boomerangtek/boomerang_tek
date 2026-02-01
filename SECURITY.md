# Security Guide

## Overview

Boomerang 🪃 handles sensitive data (private keys) and financial transactions. This document outlines security best practices and implementation details.

## Private Key Security

### Encryption

All private keys are encrypted using **AES-256-GCM** before storage:

```javascript
// Encryption algorithm
Algorithm: AES-256-GCM
Key Size: 256 bits (32 bytes)
IV: Random 16 bytes per encryption
Auth Tag: 16 bytes for integrity verification
```

### Storage

- Private keys are **never** stored in plaintext
- Encrypted keys stored in PostgreSQL with auth tag
- Master encryption key stored only in environment variables
- Keys are only decrypted in memory during execution
- No keys are logged or exposed in error messages

### Best Practices

1. **Generate strong encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Rotate encryption key periodically** (requires re-encrypting all keys)

3. **Never commit encryption keys** to version control

4. **Use different keys** for dev/staging/production

5. **Backup encryption key securely** (offline, encrypted)

## Database Security

### Connection Security

- Always use SSL/TLS for database connections
- Use connection pooling to limit connections
- Set connection timeout and idle timeout
- Use strong database passwords

### Access Control

```sql
-- Recommended: Create separate user for bot
CREATE USER emissionbot WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE emissionbot TO emissionbot;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO emissionbot;
```

### Query Safety

- All queries use parameterized statements
- No raw SQL with user input
- Input validation on all user-provided data

## API Security

### Environment Variables

Never expose:
- `MASTER_ENCRYPTION_KEY`
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `BIRDEYE_API_KEY`

### Rate Limiting

Implement rate limiting on API endpoints:

```javascript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: 'Too many requests'
});

app.use('/api', limiter);
```

### CORS Configuration

Restrict origins in production:

```javascript
const allowedOrigins = [
  'https://your-frontend-domain.com'
];

export function cors(req, res, next) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
}
```

## Telegram Bot Security

### Command Validation

- Validate all user inputs before processing
- Sanitize token addresses
- Check private key format before encryption
- Limit message length

### User Authentication

```javascript
// Verify user is who they claim to be
function verifyTelegramUser(ctx) {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  
  // Telegram provides verified user data
  return { userId, username };
}
```

### Rate Limiting

Implement per-user rate limiting:

```javascript
const userLastCommand = new Map();
const COMMAND_COOLDOWN = 2000; // 2 seconds

export async function rateLimitMiddleware(ctx, next) {
  const userId = ctx.from.id;
  const now = Date.now();
  const lastCommand = userLastCommand.get(userId) || 0;
  
  if (now - lastCommand < COMMAND_COOLDOWN) {
    await ctx.reply('Please wait before sending another command.');
    return;
  }
  
  userLastCommand.set(userId, now);
  return next();
}
```

### Message Deletion

Delete sensitive messages immediately:

```javascript
// In handleSetupMessage
try {
  await ctx.deleteMessage(ctx.message.message_id);
} catch (e) {
  // User may have deleted it already
}
```

## Transaction Security

### Amount Validation

```javascript
function validateAmount(amount) {
  if (amount <= 0) throw new Error('Amount must be positive');
  if (!Number.isFinite(amount)) throw new Error('Invalid amount');
  if (amount > MAX_SAFE_AMOUNT) throw new Error('Amount too large');
  return true;
}
```

### Slippage Protection

- Default slippage: 1% (100 bps)
- Maximum slippage: 5% (500 bps)
- Configurable per user

### Transaction Verification

```javascript
// Verify transaction before considering it successful
const confirmed = await connection.confirmTransaction({
  signature,
  blockhash,
  lastValidBlockHeight,
}, 'confirmed');

if (confirmed.value.err) {
  throw new Error('Transaction failed');
}
```

### Retry Logic

```javascript
// Limited retries with exponential backoff
async function retryTransaction(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

## Monitoring & Alerts

### Security Events to Monitor

1. Failed login attempts (if implementing admin panel)
2. Invalid private key submissions
3. Unusually large transactions
4. High error rates
5. Database connection failures
6. API rate limit hits
7. Suspicious wallet addresses

### Logging Best Practices

```javascript
// Good: Log action without sensitive data
console.log(`User ${userId} created bot config`);

// Bad: Never log private keys
console.log(`Private key: ${privateKey}`); // NEVER DO THIS

// Good: Log errors without sensitive data
console.error(`Transaction failed for config ${configId}: ${error.message}`);
```

### Error Handling

```javascript
// Sanitize errors before sending to user
function sanitizeError(error) {
  // Remove sensitive data from error messages
  const message = error.message
    .replace(/[a-zA-Z0-9]{32,}/g, '***') // Hide potential keys
    .replace(/postgresql:\/\/[^\s]+/g, '***'); // Hide DB URLs
  
  return message;
}
```

## Incident Response

### If Private Key is Compromised

1. **Immediately** pause all affected bots
2. Transfer all funds from compromised wallet
3. Delete bot configuration
4. Notify user via Telegram
5. Investigate how compromise occurred
6. Rotate encryption key if necessary

### If Database is Compromised

1. Take database offline immediately
2. Assess extent of breach
3. Rotate all encryption keys
4. Notify all users
5. Reset all bot configurations
6. Review access logs
7. Implement additional security measures

### If API Keys are Compromised

1. Revoke compromised keys immediately
2. Generate new keys
3. Update environment variables
4. Redeploy application
5. Monitor for unauthorized usage
6. Review how keys were exposed

## Security Checklist

### Pre-Deployment

- [ ] All private keys encrypted before storage
- [ ] Strong encryption key generated
- [ ] Environment variables properly set
- [ ] Database uses SSL/TLS
- [ ] No secrets in code or version control
- [ ] Input validation implemented
- [ ] Error messages sanitized
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Logging doesn't expose sensitive data

### Post-Deployment

- [ ] Monitor logs for suspicious activity
- [ ] Set up security alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Review access logs periodically
- [ ] Test incident response plan
- [ ] Backup encryption keys securely
- [ ] Document security procedures

## Regular Maintenance

### Weekly

- Review error logs
- Check for failed authentications
- Monitor unusual transaction patterns

### Monthly

- Update dependencies
- Review access permissions
- Check for security advisories
- Audit user activity

### Quarterly

- Rotate API keys
- Security audit of codebase
- Review and update security policies
- Test incident response procedures

## Dependencies Security

### Keep Updated

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

### Monitor

- Use Dependabot or Snyk
- Review changelogs for security fixes
- Test updates in staging first

## Compliance

### Data Protection

- Store minimal user data
- Encrypt sensitive data at rest
- Use secure connections for data in transit
- Provide user data deletion on request
- Log data access for audit trail

### User Privacy

- Don't share user data with third parties
- Clear privacy policy
- User consent for data collection
- Right to delete account and data

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/security-issues)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

## Contact

For security issues, please contact privately rather than opening a public issue.

**Remember: Security is an ongoing process, not a one-time setup!**
