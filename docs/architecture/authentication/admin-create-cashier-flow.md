# Admin Create Cashier Lambda - Flow Diagram

Copy this into [Mermaid Live Editor](https://mermaid.live/) to visualize.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👔 Admin (Store Owner)
    participant UI as 🖥️ Admin Dashboard
    participant Lambda as ⚡ Admin Create Cashier<br/>Lambda
    participant Cognito as 🔐 AWS Cognito
    participant DynamoDB as 💾 DynamoDB
    actor Cashier as 👤 Cashier (New Employee)

    Note over Admin,Cashier: Admin Creates Cashier Account (No Email Required!)

    Admin->>UI: Navigate to<br/>/dashboard/admin/users/create-cashier
    Admin->>UI: Fill form:<br/>• Username: "juan.cajero"<br/>• Password: "Secure123"

    UI->>UI: Validate form:<br/>• Username format ✅<br/>• Password strength ✅

    UI->>Lambda: POST /api/admin/create-cashier<br/>{ username, password }<br/>(includes admin's auth token)

    rect rgb(255, 100, 100)
        Note over Lambda: 🔒 SECURITY CHECK
        Lambda->>Lambda: Verify JWT token
        Lambda->>Lambda: Check cognito:groups<br/>contains "Admin"
        alt Not Admin
            Lambda-->>UI: ❌ 403 Forbidden
        end
    end

    rect rgb(100, 255, 100)
        Note over Lambda,DynamoDB: ✅ Admin Verified - Create Cashier

        Lambda->>Lambda: Generate internal email:<br/>"cashier_juan.cajero@internal.thesunpos.local"
        Lambda->>Lambda: Extract admin's storeId<br/>from token claims

        Lambda->>Cognito: AdminCreateUser({<br/>  username: "juan.cajero",<br/>  email: "cashier_juan.cajero@internal...",<br/>  attributes: {<br/>    custom:role: "cashier",<br/>    custom:storeId: admin.storeId,<br/>    preferred_username: "juan.cajero",<br/>    email_verified: true<br/>  },<br/>  messageAction: "SUPPRESS" 🔇<br/>})

        Cognito->>Cognito: Create user in User Pool
        Cognito->>Cognito: Mark email as verified<br/>(skip verification)

        Cognito->>Lambda: AdminSetUserPassword({<br/>  permanent: true<br/>})
        Note over Cognito: Password set permanently<br/>(no temp password flow)

        Cognito->>Lambda: AdminAddUserToGroup({<br/>  GroupName: "Cashier"<br/>})

        Cognito-->>Lambda: ✅ User created successfully

        Note over Lambda: Post-Confirmation trigger<br/>will create UserProfile<br/>in DynamoDB automatically

        Lambda-->>UI: Success response:<br/>{<br/>  username: "juan.cajero",<br/>  message: "Cashier created"<br/>}
    end

    UI->>UI: Display success message<br/>with credentials

    rect rgb(255, 200, 100)
        Note over Admin,UI: 📋 Admin Action Required
        UI->>Admin: Show printable credentials:<br/>━━━━━━━━━━━━━━━━━<br/>Username: juan.cajero<br/>Password: Secure123<br/>━━━━━━━━━━━━━━━━━
        Admin->>Admin: Print or write down<br/>credentials on paper
    end

    Admin->>Cashier: Give credentials<br/>(paper/verbal)

    Note over Cashier: 🎉 Cashier can now login immediately!

    Cashier->>UI: Go to /login
    Cashier->>UI: Enter username & password
    UI-->>Cashier: ✅ Logged in → /dashboard/cashier

    rect rgb(100, 200, 255)
        Note over Admin,Cashier: 🎯 Key Features
        Note over Lambda: • No email required from cashier<br/>• No verification emails sent<br/>• Credentials ready instantly<br/>• Linked to admin's store automatically<br/>• Admin-only function (security enforced)
    end
```

## The Problem This Solves

### Why Cashiers Don't Have Email
- 👷 Many retail/restaurant workers don't have email addresses
- 📱 They may not want to share personal email for work
- ⚡ Onboarding needs to be instant (no waiting for verification)
- 🔐 Admins need full control over access

### Why This Needs a Lambda Function

**Cannot be done from frontend because:**
1. ❌ Frontend cannot suppress Cognito emails
2. ❌ Frontend cannot set `email_verified = true`
3. ❌ Frontend cannot use `AdminCreateUser` (admin-only AWS API)
4. ❌ Security: Must verify caller is actually an admin

**Lambda function enables:**
1. ✅ Generate internal email format (never exposed to user)
2. ✅ Skip email verification step
3. ✅ Set permanent password (no temp password flow)
4. ✅ Suppress all email notifications
5. ✅ Enforce admin-only access via token validation

## User Flow Comparison

### Traditional Flow (Won't Work for Us)
```
Cashier provides email → Receives verification email →
Clicks link → Verifies email → Can login
❌ Problem: Cashiers don't have email!
```

### Our Flow (With This Lambda)
```
Admin creates account → Gives credentials to cashier →
Cashier logs in immediately
✅ Solution: No email needed!
```

## Security Features

1. **Admin Verification**: Checks `cognito:groups` contains "Admin"
2. **Token Validation**: Verifies JWT signature from Cognito
3. **Store Isolation**: Cashier automatically linked to admin's store
4. **No Email Exposure**: Internal email never shown in UI
5. **Audit Trail**: CloudWatch logs all cashier creations

## What Happens Behind the Scenes

```typescript
// 1. Lambda generates internal email
const internalEmail = `cashier_${username}@internal.thesunpos.local`;

// 2. Creates user with custom attributes
await cognito.adminCreateUser({
  UserPoolId: process.env.USER_POOL_ID,
  Username: username,
  UserAttributes: [
    { Name: 'email', Value: internalEmail },
    { Name: 'email_verified', Value: 'true' }, // Skip verification
    { Name: 'preferred_username', Value: username },
    { Name: 'custom:role', Value: 'cashier' },
    { Name: 'custom:storeId', Value: adminStoreId }, // From admin's token
  ],
  MessageAction: 'SUPPRESS', // Don't send emails!
});

// 3. Set permanent password (no temp password)
await cognito.adminSetUserPassword({
  UserPoolId: process.env.USER_POOL_ID,
  Username: username,
  Password: password,
  Permanent: true,
});

// 4. Add to Cashier group
await cognito.adminAddUserToGroup({
  UserPoolId: process.env.USER_POOL_ID,
  Username: username,
  GroupName: 'Cashier',
});
```

## Result

✅ Cashier can login immediately with username + password
✅ No email verification needed
✅ Admin maintains full control
✅ Multi-tenant isolation enforced
✅ Secure and compliant with AWS best practices
