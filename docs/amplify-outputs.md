# Amplify Outputs Configuration

## About `amplify_outputs.json`

This file contains AWS Amplify backend configuration values. It is **auto-generated** when you deploy or run the Amplify backend.

### Development Setup

For local development **before backend deployment**, a placeholder `amplify_outputs.json` file is provided with dummy values to prevent TypeScript import errors.

### Production Setup

When you deploy the Amplify backend, this file will be automatically generated with real values:

```bash
# Start local sandbox (generates real outputs)
npx ampx sandbox

# Or deploy to production
npx ampx pipeline-deploy --branch main
```

The file will contain:
- **Cognito User Pool ID** - For authentication
- **User Pool Client ID** - For sign-in/sign-up
- **Identity Pool ID** - For AWS credentials
- **AppSync API Endpoint** - For GraphQL queries
- **AWS Region** - Deployment region

### Security Notes

⚠️ **Do NOT commit** `amplify_outputs.json` with real values to version control!

- The file is listed in `.gitignore`
- Placeholder values are safe for development
- Real values are sensitive and environment-specific

### File Structure

```json
{
  "auth": {
    "user_pool_id": "us-east-1_XXXXXXXXX",
    "user_pool_client_id": "XXXXXXXXXXXXXXXXXXXXXXXXXX",
    "identity_pool_id": "us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "aws_region": "us-east-1"
  },
  "data": {
    "url": "https://XXXXXX.appsync-api.us-east-1.amazonaws.com/graphql",
    "aws_region": "us-east-1",
    "default_authorization_type": "AMAZON_COGNITO_USER_POOLS"
  }
}
```

### Troubleshooting

**Import errors in TypeScript?**
- Make sure `amplify_outputs.json` exists in project root
- Run `npx ampx sandbox` to generate real configuration

**Authentication not working?**
- Verify you're running `npx ampx sandbox` for local backend
- Check that values in `amplify_outputs.json` match your AWS console

---

**See also:**
- [AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md](./AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md) - Full backend setup guide
- [Amplify Gen 2 Docs](https://docs.amplify.aws/react/) - Official documentation
