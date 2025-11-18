# n8n Integration - Summary

**Created on:** 2025-11-18
**Project:** AI Voice Generator by SmartCamp.AI

## Files Created

### Workflow Definitions (5 files)
Located in: `/home/user/ai-voice-generator/n8n/workflows/`

1. **user-onboarding.json** (204 lines)
   - Webhook trigger for new user signup
   - Sends welcome email via Resend
   - Creates CRM entry (optional)
   - Adds user to email marketing list (optional)
   - Returns success response

2. **generation-complete.json** (253 lines)
   - Webhook trigger when voice generation finishes
   - Sends notification email with audio links
   - Updates analytics platform (optional)
   - Triggers custom user webhooks if configured
   - Supports user-defined callback URLs

3. **credit-threshold.json** (303 lines)
   - Webhook trigger for credit alerts (80%, 90%, 100%)
   - Sends escalating alert emails based on severity
   - Optional Slack notifications for team awareness
   - Conditional logic for different threshold levels
   - Integrates with purchasing flow

4. **subscription-changed.json** (263 lines)
   - Webhook trigger on subscription events
   - Updates user credits automatically
   - Sends subscription confirmation email
   - Updates CRM/billing systems (optional)
   - Tracks subscription events in analytics

5. **invoice-generation.json** (355 lines)
   - Scheduled trigger (monthly on 1st)
   - Calculates monthly usage per user
   - Generates PDF invoices via Gotenberg
   - Uploads PDFs to Supabase Storage
   - Emails invoices to users
   - Records invoice data in database

### TypeScript Client Library (1 file)
Located in: `/home/user/ai-voice-generator/src/lib/n8n/webhooks.ts`

**webhooks.ts** (441 lines)
- Type-safe interfaces for all webhook payloads
- `triggerUserOnboarding()` - Trigger user signup workflow
- `triggerGenerationComplete()` - Trigger generation complete workflow
- `triggerCreditAlert()` - Trigger credit threshold alerts
- `triggerSubscriptionChanged()` - Trigger subscription events
- `triggerInvoiceGeneration()` - Manually trigger invoice generation
- `triggerMultipleWebhooks()` - Batch webhook triggering
- `testWebhookConnection()` - Connection testing utility
- `getWebhookConfig()` - Configuration inspection
- Built-in retry logic with exponential backoff
- Error logging and monitoring
- Configurable timeouts and retry attempts

### Documentation (2 files)

**README.md** (506 lines)
- Complete setup instructions
- Environment variable configuration
- Workflow details and payload schemas
- Security best practices
- Troubleshooting guide
- Advanced configuration examples

**INTEGRATION_EXAMPLES.md** (613 lines)
- Real-world integration examples
- User registration workflow
- Voice generation workflow
- Credit monitoring implementation
- Stripe webhook integration
- Database schema requirements
- Testing procedures
- Best practices

## Quick Start

### 1. Setup n8n

```bash
# Using Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e WEBHOOK_URL=https://n8n.smartcamp.ai \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

### 2. Import Workflows

1. Open n8n UI
2. Import each JSON file from `workflows/` directory
3. Configure environment variables
4. Activate workflows

### 3. Configure Application

Add to `.env.local`:

```bash
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
N8N_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Use in Application

```typescript
import { triggerUserOnboarding } from '@/lib/n8n/webhooks';

await triggerUserOnboarding({
  userId: user.id,
  email: user.email,
  name: user.name,
  bonusCredits: 1000,
  createdAt: user.created_at,
});
```

## Key Features

### Reliability
- Automatic retry logic (3 attempts by default)
- Configurable timeouts (5 seconds default)
- Exponential backoff between retries
- Error logging and monitoring

### Type Safety
- Full TypeScript type definitions
- Interface-driven payloads
- Compile-time validation
- IntelliSense support

### Flexibility
- Optional CRM integration
- Optional analytics tracking
- Custom webhook support
- Batch operations
- Easy extensibility

### Security
- Webhook secret authentication
- Environment variable configuration
- No hardcoded credentials
- Secure error handling

## Environment Variables

### Required

```bash
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
EMAIL_API_KEY=re_your_resend_key
EMAIL_FROM=noreply@smartcamp.ai
```

### Optional

```bash
N8N_WEBHOOK_SECRET=your-webhook-secret
CRM_API_URL=https://api.yourcrm.com
CRM_API_KEY=your_crm_key
EMAIL_LIST_API_URL=https://api.convertkit.com
EMAIL_LIST_API_KEY=your_email_list_key
ANALYTICS_API_URL=https://analytics.yourservice.com
ANALYTICS_API_KEY=your_analytics_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
WEBHOOK_TIMEOUT=5000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=1000
```

## Workflow Triggers

| Workflow | Trigger Type | Frequency | Purpose |
|----------|-------------|-----------|---------|
| User Onboarding | Webhook | On signup | Welcome new users |
| Generation Complete | Webhook | Per generation | Notify completion |
| Credit Threshold | Webhook | On threshold | Alert low credits |
| Subscription Changed | Webhook | On change | Confirm subscription |
| Invoice Generation | Schedule | Monthly (1st) | Generate invoices |

## Integration Points

### 1. Auth System
- Trigger onboarding after successful signup
- Send welcome email
- Create CRM contact

### 2. Generation API
- Trigger on generation complete
- Send notification email
- Update analytics
- Call custom webhooks

### 3. Credit System
- Monitor credit usage
- Trigger alerts at 80%, 90%, 100%
- Send purchase reminders

### 4. Stripe Integration
- Listen to subscription events
- Update user credits
- Send confirmations
- Track in CRM

### 5. Billing System
- Monthly invoice generation
- PDF creation via Gotenberg
- Email delivery
- Record keeping

## Testing

```typescript
// Test connection
import { testWebhookConnection } from '@/lib/n8n/webhooks';
const isConnected = await testWebhookConnection();

// Test individual workflow
import { triggerUserOnboarding } from '@/lib/n8n/webhooks';
await triggerUserOnboarding({
  userId: 'test-123',
  email: 'test@example.com',
  name: 'Test User',
  bonusCredits: 1000,
  createdAt: new Date().toISOString(),
});
```

## Monitoring

### n8n Executions
- View in n8n UI: Executions tab
- Filter by workflow
- Check success/failure rates
- Debug failed executions

### Application Logs
```bash
# View webhook logs
docker logs your-app | grep "n8n"

# View errors
docker logs your-app | grep "n8n Webhook Error"
```

### Error Tracking
Consider integrating with:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for monitoring
- Custom logging service

## File Structure

```
/home/user/ai-voice-generator/
├── n8n/
│   ├── workflows/
│   │   ├── user-onboarding.json
│   │   ├── generation-complete.json
│   │   ├── credit-threshold.json
│   │   ├── subscription-changed.json
│   │   └── invoice-generation.json
│   ├── README.md
│   ├── INTEGRATION_EXAMPLES.md
│   └── SUMMARY.md (this file)
└── src/
    └── lib/
        └── n8n/
            └── webhooks.ts
```

## Statistics

- **Total Files Created:** 8
- **Total Lines of Code:** 2,938
- **Workflow Definitions:** 5
- **TypeScript Functions:** 9
- **Type Interfaces:** 7
- **Documentation Pages:** 2

## Next Steps

1. **Setup n8n Instance**
   - Deploy n8n (Docker or Cloud)
   - Configure domain and SSL
   - Set up authentication

2. **Import Workflows**
   - Import all 5 JSON files
   - Configure environment variables
   - Test each workflow individually

3. **Integrate Client Library**
   - Install dependencies
   - Configure environment variables
   - Add webhook calls to your application

4. **Test Integration**
   - Run connection tests
   - Test each workflow
   - Verify email delivery
   - Check error handling

5. **Monitor & Optimize**
   - Set up monitoring
   - Review execution logs
   - Optimize workflow performance
   - Add custom integrations

## Support Resources

- **n8n Documentation:** https://docs.n8n.io
- **Workflow Files:** `/home/user/ai-voice-generator/n8n/workflows/`
- **Client Library:** `/home/user/ai-voice-generator/src/lib/n8n/webhooks.ts`
- **Examples:** `/home/user/ai-voice-generator/n8n/INTEGRATION_EXAMPLES.md`
- **Setup Guide:** `/home/user/ai-voice-generator/n8n/README.md`

## License

Part of AI Voice Generator by SmartCamp.AI

---

**Created by:** Claude Code
**Date:** 2025-11-18
**Version:** 1.0.0
