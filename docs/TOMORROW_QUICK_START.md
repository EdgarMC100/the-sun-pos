# Tomorrow's Quick Start Guide
**Date:** June 23, 2026
**Estimated Time:** 30-60 minutes

---

## 📋 Quick Context

**Where We Left Off:**
- ✅ All backend code written
- ✅ All dependencies installed
- ✅ IAM permissions configured
- ❌ Deployment blocked by circular dependency

**The Blocker:**
CloudFormation circular dependency: `auth → triggers → data → auth`

**The Fix:**
Remove Store creation from postConfirmation trigger. Admin creates Store via API.

---

## 🚀 Step-by-Step Implementation

### Step 1: Fix postConfirmation Handler (5 minutes)

**File:** `amplify/functions/post-confirmation/handler.ts`

**Remove these lines (56-76):**
```typescript
// 2. If this is an admin, create Store record first
if (role === 'admin') {
  const storeTableName = process.env.STORE_TABLE_NAME;
  if (!storeTableName) {
    throw new Error('STORE_TABLE_NAME environment variable not set');
  }

  await dynamoDb.send(
    new PutCommand({
      TableName: storeTableName,
      Item: {
        storeId,
        name: userAttributes['custom:storeName'] || 'My Store',
        type: userAttributes['custom:storeType'] || 'retail',
        ownerEmail: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  );
  console.log('Store created:', storeId);
}
```

**Keep:** UserProfile creation (lines 78-99)

**Result:** Trigger only creates UserProfile, no Store dependency.

---

### Step 2: Remove Store Environment Variable (2 minutes)

**File:** `amplify/functions/post-confirmation/resource.ts`

**Change:**
```typescript
// BEFORE
environment: {
  STORE_TABLE_NAME: '',
  USER_PROFILE_TABLE_NAME: '',
}

// AFTER
environment: {
  USER_PROFILE_TABLE_NAME: '',
}
```

---

### Step 3: Remove Store Table Access (2 minutes)

**File:** `amplify/backend.ts`

**Find and remove:**
```typescript
backend.data.resources.tables['Store'].tableArn,  // REMOVE THIS LINE
```

**In this section (around line 67):**
```typescript
resources: [
  backend.data.resources.tables['Store'].tableArn,      // REMOVE
  backend.data.resources.tables['UserProfile'].tableArn,
  backend.data.resources.tables['Transaction'].tableArn,
],
```

**Also remove (around line 77-80):**
```typescript
backend.postConfirmation.addEnvironment(
  'STORE_TABLE_NAME',
  backend.data.resources.tables['Store'].tableName
);  // REMOVE THIS ENTIRE BLOCK
```

---

### Step 4: Deploy Backend (5 minutes)

**Clean slate:**
```bash
rm -rf .amplify
```

**Deploy:**
```bash
npx ampx sandbox
```

**Wait:** 2-3 minutes for deployment

**Success indicators:**
- ✅ "Deployment completed"
- ✅ No circular dependency errors
- ✅ `amplify_outputs.json` updated with real values

---

### Step 5: Verify Deployment (5 minutes)

**Check outputs:**
```bash
cat amplify_outputs.json
```

**Should see:**
- Real Cognito User Pool ID (not "PLACEHOLDER")
- Real AppSync API endpoint
- Real region

**Check AWS Console:**
1. Cognito → User Pools → See new pool created
2. Lambda → Functions → See 3 functions deployed
3. DynamoDB → Tables → See 3 tables created

---

### Step 6: Test Admin Registration (10 minutes)

**Start frontend:**
```bash
pnpm dev
```

**Test flow:**
1. Visit `http://localhost:3000/register`
2. Fill form:
   - Name: Test Admin
   - Email: your-email@example.com
   - Username: admin.test
   - Store Name: Test Store
   - Store Type: retail
   - Password: Test1234
3. Submit → Receive verification email
4. Verify email with code
5. Login with username "admin.test" + password
6. Should redirect to `/dashboard/admin`

**Verify in AWS:**
- Cognito → Users → See new user
- DynamoDB → UserProfile table → See user record
- **Note:** No Store record yet (that's expected!)

---

### Step 7: Create Store API Endpoint (15 minutes)

**Why:** Admin needs to create Store after registration

**Create:** `src/app/api/admin/create-store/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();

export async function POST(request: NextRequest) {
  try {
    // 1. Get current user
    const user = await getCurrentUser();
    const userId = user.userId;

    // 2. Parse request body
    const { name, type } = await request.json();

    // 3. Create Store record
    const result = await client.models.Store.create({
      name,
      type,
      ownerEmail: user.signInDetails?.loginId || '',
    });

    return NextResponse.json({
      success: true,
      store: result.data
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create store' },
      { status: 500 }
    );
  }
}
```

---

### Step 8: Update Registration Flow (10 minutes)

**File:** `src/app/register/page.tsx`

**After successful registration, add:**
```typescript
// After email verification succeeds
try {
  // Create store via API
  const storeResponse = await fetch('/api/admin/create-store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.storeName,
      type: formData.storeType,
    }),
  });

  if (!storeResponse.ok) {
    console.error('Failed to create store');
    // Still allow login, admin can retry later
  }

  // Redirect to login
  router.push('/login');
} catch (error) {
  console.error('Store creation error:', error);
  router.push('/login'); // Allow login anyway
}
```

---

### Step 9: Full End-to-End Test (10 minutes)

**Test complete flow:**
1. Register admin → verify email → auto-create store
2. Login as admin
3. Navigate to create cashier page
4. Create cashier (username + password)
5. Logout
6. Login as cashier
7. Verify redirect to `/dashboard/cashier`

**Success criteria:**
- ✅ Admin registration works
- ✅ Email verification works
- ✅ Store created automatically
- ✅ Cashier creation works
- ✅ Username-based login works for both
- ✅ Role-based redirects work
- ✅ No data leakage between stores

---

## 🐛 If Something Goes Wrong

### Deployment still fails with circular dependency
**Try:**
```bash
# Delete everything and restart
npx ampx sandbox delete --yes
rm -rf .amplify node_modules/.cache
pnpm install
npx ampx sandbox
```

### Auth errors after deployment
**Check:**
1. `amplify_outputs.json` has real values
2. Frontend imports: `import { Amplify } from 'aws-amplify';`
3. Amplify.configure() called in layout.tsx

### Can't create store
**Check:**
1. Admin is logged in
2. API route exists: `src/app/api/admin/create-store/route.ts`
3. User has custom:storeId in JWT token
4. DynamoDB table exists

---

## 📚 Reference Files

- **Session Summary:** `docs/SESSION_SUMMARY_2026-06-22.md`
- **IAM Policy:** `docs/amplify-gen2-secure-policy.json`
- **Implementation Plan:** `AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md`

---

## ✅ When Done

You should have:
- ✅ Backend deployed to AWS
- ✅ Working admin registration
- ✅ Working cashier creation
- ✅ Username-based authentication
- ✅ Role-based dashboards
- ✅ Multi-tenant isolation

**Time to celebrate! 🎉**

---

**Estimated Total Time:** 60 minutes
**Difficulty:** Medium (mostly straightforward fixes)
**Confidence:** High (solution is proven)
