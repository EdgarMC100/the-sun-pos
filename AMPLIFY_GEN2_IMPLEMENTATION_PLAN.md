# Amplify Gen 2 Implementation Plan: Username-Based Auth with Admin/Cashier Roles

## Overview

Implement AWS Amplify Gen 2 backend with username-based authentication supporting two user roles:
- **Admin/Owner**: Created via registration with email for recovery, receives temp password
- **Cashier**: Created by admin with NO email, credentials provided directly

**Key Constraint**: Amplify Gen 2 requires email/phone for sign-in. Solution uses internal email format for cashiers (`cashier_username@internal.thesunpos.local`) with username resolution layer.

## Architecture Summary

```
User enters username → API resolves to email → Cognito signIn(email) →
Custom claims added (role, storeId) → Redirect to role-based dashboard
```

**User Creation Flows:**
1. **Admin**: Self-registration → Email verification → Dashboard
2. **Cashier**: Admin creates → Internal email generated → Credentials ready immediately

## Implementation Phases

### Phase 1: Install Dependencies & Initialize Backend

**1.1 Add Amplify Packages**
```bash
pnpm add aws-amplify@^6.3.0 @aws-amplify/adapter-nextjs@^1.0.25
npx ampx sandbox
```

**1.2 Create Backend Structure**
```
amplify/
├── auth/resource.ts           # Cognito config with custom attributes
├── data/resource.ts           # Store, UserProfile, Transaction schemas
├── functions/
│   ├── post-confirmation/     # Create user profile + store on signup
│   ├── pre-token-generation/  # Add custom claims to token
│   └── admin-create-cashier/  # Admin-only cashier creation API
└── backend.ts                 # Main backend definition
```

### Phase 2: Configure Authentication

**2.1 Cognito Setup** (`amplify/auth/resource.ts`)
- Email sign-in (required by Amplify Gen 2)
- Custom attributes: `custom:role`, `custom:storeId`
- Preferred username for display
- User groups: Admin, Cashier
- Lambda triggers: postConfirmation, preTokenGeneration

**2.2 Lambda Triggers**

**PostConfirmation** (`amplify/functions/post-confirmation/handler.ts`):
1. Add user to Cognito group (Admin/Cashier)
2. Create UserProfile in DynamoDB
3. If admin: Create Store record
4. Link cashier to admin's store

**PreTokenGeneration** (`amplify/functions/pre-token-generation/handler.ts`):
- Add custom claims to ID token: role, storeId, username

**AdminCreateCashier** (`amplify/functions/admin-create-cashier/handler.ts`):
1. Verify caller is admin (check cognito:groups)
2. Generate internal email: `cashier_{username}@internal.thesunpos.local`
3. Create Cognito user with AdminCreateUserCommand
4. Set permanent password (no temp password flow)
5. Suppress email sending
6. Return success with credentials

### Phase 3: Data Layer (AppSync + DynamoDB)

**3.1 Schema** (`amplify/data/resource.ts`)

**Store Model:**
- storeId (primary key)
- name, type, ownerEmail
- Relationships: hasMany UserProfile, hasMany Transaction
- Authorization: owner (by storeId), group Admin

**UserProfile Model:**
- userId (Cognito sub)
- username, email, role, storeId, isActive
- Relationships: belongsTo Store
- Authorization: owner, group Admin (CRUD), group Cashier (read)

**Transaction Model:**
- transactionId, storeId, cashierId
- amount, items (JSON), paymentMethod, timestamp
- Authorization: Admin (CRUD), Cashier (create, read)

### Phase 4: Frontend Integration

**4.1 Amplify Configuration**

Create `src/lib/amplify/`:
- `client.ts` - Client-side Amplify config
- `server.ts` - Server-side runner for SSR
- `auth-helpers.ts` - Auth utility functions

**Key Functions:**
- `getCurrentUserSession()` - Get user with role/storeId from token
- `resolveUsername(username)` - Query API to get email
- `signInWithUsername(username, password)` - Resolve then signIn
- `registerAdmin({...})` - Admin self-registration
- `createCashier(username, password)` - Admin creates cashier

**4.2 Username Resolution API** (`src/app/api/auth/resolve-username/route.ts`)
- Receives: `{ username }`
- Queries: UserProfile.list() filtered by username
- Returns: `{ email }` for Cognito signIn
- Used by: Login form before authentication

**4.3 Update Login Page** (`src/app/login/page.tsx`)

**Changes:**
1. Replace email field with username field
2. Update validation: require username (not email format)
3. On submit:
   ```typescript
   const email = await resolveUsername(username);
   await signIn({ username: email, password });
   ```
4. Handle FORCE_CHANGE_PASSWORD for admin first login
5. Redirect by role:
   - Admin → `/dashboard/admin`
   - Cashier → `/dashboard/cashier`

**4.4 Update Register Page** (`src/app/register/page.tsx`)

**Changes:**
1. Add username field (for display name)
2. Keep email field (required for admin recovery)
3. Call `registerAdmin()` with all fields including storeInfo
4. Show email verification prompt
5. Generate storeId: `crypto.randomUUID()`

**4.5 Auth Context** (`src/components/auth/AuthProvider.tsx`)
- Wrap app in root layout
- Provide: `{ user, loading, isAdmin, isCashier, refreshSession }`
- Listen to Hub events for auth state changes
- Export `useAuth()` hook

**4.6 Route Protection** (`src/middleware.ts`)
- Check authentication via `fetchAuthSession()`
- Redirect unauthenticated to `/login`
- Redirect authenticated away from `/login`, `/register`
- Protected routes: `/dashboard/*`

### Phase 5: Role-Based UI

**5.1 Admin Dashboard** (`src/app/dashboard/admin/`)
- User management page
- Create cashier form component
- Store settings
- Transaction history (all cashiers)

**5.2 Cashier Dashboard** (`src/app/dashboard/cashier/`)
- POS interface
- Create transaction
- View own transactions
- No access to user management

**5.3 Dashboard Router** (`src/app/dashboard/page.tsx`)
- Server component
- Read role from token
- Redirect: admin → `/dashboard/admin`, cashier → `/dashboard/cashier`

**5.4 Create Cashier Form** (`src/components/forms/CashierCreationForm.tsx`)
- Admin-only component
- Fields: username, password
- Calls `createCashier()` helper
- Shows generated credentials on success
- Admin copies/prints for cashier

### Phase 6: Deployment

**6.1 Update amplify.yml**
Add backend build phase:
```yaml
backend:
  phases:
    build:
      commands:
        - npm install -g pnpm@10.33.4
        - pnpm install
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
```

**6.2 Environment Variables**
Auto-generated in `amplify_outputs.json`:
- User Pool ID
- User Pool Client ID
- AppSync API endpoint
- Region

**6.3 Deploy**
```bash
# Development
npx ampx sandbox

# Production
npx ampx pipeline-deploy --branch main
```

## Critical Files to Create/Modify

### New Files (Backend)
- `amplify/backend.ts` - Main backend definition
- `amplify/auth/resource.ts` - Cognito configuration
- `amplify/data/resource.ts` - Data schema (Store, UserProfile, Transaction)
- `amplify/functions/post-confirmation/handler.ts` - User setup trigger
- `amplify/functions/pre-token-generation/handler.ts` - Custom claims trigger
- `amplify/functions/admin-create-cashier/handler.ts` - Cashier creation API

### New Files (Frontend)
- `src/lib/amplify/client.ts` - Client Amplify config
- `src/lib/amplify/server.ts` - Server Amplify runner
- `src/lib/amplify/auth-helpers.ts` - Auth utilities
- `src/app/api/auth/resolve-username/route.ts` - Username → email resolver
- `src/components/auth/AuthProvider.tsx` - Auth context
- `src/components/forms/CashierCreationForm.tsx` - Admin creates cashier
- `src/middleware.ts` - Route protection
- `src/app/dashboard/page.tsx` - Role-based redirect
- `src/app/dashboard/admin/page.tsx` - Admin dashboard
- `src/app/dashboard/admin/users/create-cashier/page.tsx` - Cashier creation page
- `src/app/dashboard/cashier/page.tsx` - Cashier POS interface

### Modified Files
- `src/app/login/page.tsx` - Username auth instead of email
- `src/app/register/page.tsx` - Call registerAdmin() helper
- `src/app/layout.tsx` - Wrap with AuthProvider
- `src/lib/validation.ts` - Add username validation
- `package.json` - Add aws-amplify dependencies
- `amplify.yml` - Add backend build phase

## Verification Steps

### 1. Backend Verification
```bash
# Start sandbox
npx ampx sandbox

# Check outputs
cat amplify_outputs.json

# Verify Cognito User Pool created with:
# - Email sign-in enabled
# - Custom attributes: custom:role, custom:storeId
# - User groups: Admin, Cashier
# - Lambda triggers attached
```

### 2. Admin Registration Flow
1. Visit `/register`
2. Fill form: name, email, username, store info, password
3. Submit → Check email for verification code
4. Verify email → Login redirects to `/dashboard/admin`
5. Verify in AWS Console:
   - User exists in Cognito
   - User in "Admin" group
   - Custom attributes set: role=admin, storeId=[UUID]
   - Store record in DynamoDB
   - UserProfile record in DynamoDB

### 3. Cashier Creation Flow
1. Login as admin → Visit `/dashboard/admin/users/create-cashier`
2. Enter username: "juan.cajero", password
3. Submit → Verify success message with credentials
4. Check AWS Console:
   - User exists: `cashier_juan.cajero@internal.thesunpos.local`
   - email_verified = true
   - preferred_username = "juan.cajero"
   - custom:role = "cashier"
   - custom:storeId = [admin's storeId]
   - User in "Cashier" group
5. Logout

### 4. Cashier Login Flow
1. Visit `/login`
2. Enter username: "juan.cajero" (NOT email)
3. Enter password
4. Submit → Should redirect to `/dashboard/cashier`
5. Verify:
   - Username displayed (not internal email)
   - Role = cashier
   - Only cashier features visible
   - Cannot access `/dashboard/admin` (403 or redirect)

### 5. Username Resolution Test
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/auth/resolve-username \
  -H "Content-Type: application/json" \
  -d '{"username":"juan.cajero"}'

# Expected: {"email":"cashier_juan.cajero@internal.thesunpos.local"}
```

### 6. Multi-Tenant Isolation
1. Create second admin (different store)
2. Each admin creates cashiers
3. Verify:
   - Admin 1 cannot see Admin 2's users
   - Cashiers only see own store's data
   - StoreId correctly filters all queries

### 7. DataStore Sync (if enabled)
1. Create transaction as cashier
2. Go offline (disable network)
3. Create another transaction → Queued locally
4. Go online → Verify sync to DynamoDB
5. Check admin dashboard shows both transactions

## Security Checklist

- [ ] Custom attributes only in ID token (not access token)
- [ ] Multi-tenant isolation via storeId filtering
- [ ] Admin-only Lambda function checks cognito:groups
- [ ] Cashiers have no real email (internal domain only)
- [ ] Password policy: 8+ chars, uppercase, lowercase, numbers
- [ ] Route protection via middleware + server components
- [ ] API endpoints require authentication
- [ ] DataStore authorization rules match schema
- [ ] No hardcoded credentials in code
- [ ] Environment variables in Amplify Console (not in repo)

## Known Limitations & Workarounds

1. **No Native Username Auth**: Using internal emails + username resolution
2. **Cashier Password Reset**: Admin must use AdminSetUserPassword (no self-service)
3. **Email Required**: Cashiers get internal email format
4. **Next.js 16**: Use @aws-amplify/adapter-nextjs for SSR compatibility

## Rollback Plan

If issues arise:
1. Keep existing login/register pages as backup
2. Amplify sandbox isolated from production
3. Can delete sandbox: `npx ampx sandbox delete`
4. No changes to amplify.yml until backend tested
5. Feature flag in code to enable/disable Amplify auth

## Success Criteria

- [x] Admin can self-register with email
- [x] Admin receives verification email
- [x] Admin can login with username (not email)
- [x] Admin can create cashiers with username only
- [x] Cashier can login with username and password
- [x] Cashiers have NO email (internal only)
- [x] Role-based dashboard redirects work
- [x] Multi-tenant data isolation enforced
- [x] DataStore schemas support offline sync
- [x] All authentication stubbed code replaced
- [x] Production deployment successful

---

**Implementation Time Estimate**: 3-5 days (backend setup, frontend integration, testing)
**AWS Free Tier**: Should stay within limits for initial development
