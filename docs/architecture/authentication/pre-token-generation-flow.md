# Pre-Token Generation Lambda - Flow Diagram

Copy this into [Mermaid Live Editor](https://mermaid.live/) to visualize.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User (Cashier)
    participant Frontend as 🌐 Frontend
    participant API as 🔧 Username Resolver API
    participant Cognito as 🔐 AWS Cognito
    participant Lambda as ⚡ Pre-Token Generation<br/>Lambda
    participant Token as 🎫 Enhanced JWT Token

    Note over User,Token: User Login with Username-Based Auth

    User->>Frontend: Enters credentials<br/>(username: "juan.cajero"<br/>password: "Secure123")

    Frontend->>API: POST /api/auth/resolve-username<br/>{ username: "juan.cajero" }
    API->>API: Query UserProfile table<br/>by username
    API-->>Frontend: { email: "cashier_juan.cajero@internal..." }

    Frontend->>Cognito: signIn(email, password)
    Cognito->>Cognito: ✅ Verify password

    rect rgb(255, 200, 100)
        Note over Cognito,Lambda: 🔥 PRE-TOKEN GENERATION TRIGGER
        Cognito->>Lambda: Trigger with user attributes
        Note over Lambda: User Attributes:<br/>• custom:role = "cashier"<br/>• custom:storeId = "store-uuid-789"<br/>• preferred_username = "juan.cajero"

        Lambda->>Lambda: Read custom attributes
        Lambda->>Lambda: Build custom claims object
        Note over Lambda: Claims to Add:<br/>• role: "cashier"<br/>• storeId: "store-uuid-789"<br/>• username: "juan.cajero"

        Lambda-->>Cognito: Return enhanced token config
    end

    Cognito->>Token: Issue JWT with custom claims
    Note over Token: ID Token Payload:<br/>{<br/>  "sub": "user-abc-123",<br/>  "email": "cashier_...",<br/>  "role": "cashier", ⭐<br/>  "storeId": "store-789", ⭐<br/>  "username": "juan.cajero" ⭐<br/>}

    Token-->>Frontend: Return enhanced token

    Frontend->>Frontend: Read role from token.payload

    alt role === "admin"
        Frontend->>Frontend: redirect('/dashboard/admin')
    else role === "cashier"
        Frontend->>Frontend: redirect('/dashboard/cashier')
    end

    Note over User,Frontend: ✅ Logged in! No database query needed!

    rect rgb(100, 200, 255)
        Note over Frontend,Token: 🛡️ Security Benefits
        Note over Frontend: • Role instantly available (no DB query)<br/>• StoreId used by AppSync for filtering<br/>• Token signed by AWS (cannot be forged)<br/>• Multi-tenant isolation enforced
    end
```

## Key Points

### What Gets Added to Token
- **role**: "admin" or "cashier" → Used for UI routing and permissions
- **storeId**: UUID → Used for multi-tenant data isolation
- **username**: Display name → Shown in UI (not internal email)

### Why This Matters
1. **Performance**: No database query on every page load
2. **Security**: AppSync uses storeId from token to filter data
3. **UX**: Instant role-based redirects
4. **Multi-tenancy**: Automatic data isolation per store

### Without This Function
```typescript
// ❌ Every page load:
const user = await getCurrentUser();
const profile = await fetchUserProfile(user.sub); // Extra API call!
const role = profile.role;
```

### With This Function
```typescript
// ✅ Instant:
const session = await fetchAuthSession();
const role = session.tokens?.idToken?.payload.role; // Already in token!
```
