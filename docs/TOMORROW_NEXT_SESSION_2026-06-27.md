# Tomorrow's Session - Quick Start
**Date:** 2026-06-27
**Last Session:** 2026-06-26

---

## 🎯 Main Goal

**Fix UserProfile Creation** - The only remaining blocker in the authentication flow.

---

## 🐛 The Issue

When a user logs in for the first time, `handleFirstLogin()` attempts to create a UserProfile record, but fails with:

```
Error creating UserProfile: NoValidAuthTokens: No federated jwt
POST /api/user-profile/create 500
```

**Impact:**
- ❌ UserProfile not stored in DynamoDB
- ✅ User still authenticated (Cognito is fine)
- ✅ Dashboard loads correctly
- ✅ Role and storeId available from JWT token

---

## 🔍 Investigation Steps

### 1. Check the UserProfile Creation API

**File:** `src/app/api/user-profile/create/route.ts`

**Look for:**
- Auth mode configuration - Is it using 'iam' or 'userPool'?
- Server context setup - Is it properly configured for authenticated requests?
- Timing issue - Is the token available when API is called?

### 2. Check handleFirstLogin Function

**File:** `src/lib/amplify/auth-helpers.ts` (around line 300-400)

**Look for:**
- When is this function called? (After signIn succeeds)
- How does it call the API? (fetch with credentials?)
- Does it wait for auth session to be established?

### 3. Check AppSync Authorization Rules

**File:** `amplify/data/resource.ts`

**Look for UserProfile model authorization:**
```typescript
.authorization((allow) => [
  allow.owner(), // Does this work?
  allow.group('Admin'),
  // etc.
])
```

---

## 💡 Possible Solutions

### Option A: Use Authenticated Auth Mode in API
```typescript
// In /api/user-profile/create/route.ts
const client = generateClient<Schema>(contextSpec, {
  authMode: 'userPool' // Instead of 'iam'
});
```

### Option B: Move to Lambda Trigger
Create UserProfile in `postConfirmation` trigger instead of API call:
- More reliable (runs server-side)
- No auth token issues
- Automatic on email confirmation

### Option C: Add Delay Before API Call
Wait for auth session to fully establish:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
const response = await fetch('/api/user-profile/create', ...);
```

---

## 📋 Step-by-Step Fix Plan

### Step 1: Read Current Implementation
```bash
# Read the API endpoint
cat src/app/api/user-profile/create/route.ts

# Read the auth helper
cat src/lib/amplify/auth-helpers.ts | grep -A 50 "handleFirstLogin"

# Read AppSync schema
cat amplify/data/resource.ts | grep -A 20 "UserProfile"
```

### Step 2: Try Fix (Option A First)
1. Modify API to use `authMode: 'userPool'`
2. Ensure session is passed correctly
3. Test login flow

### Step 3: Verify Fix
```bash
# Start dev server
pnpm dev

# Register new test user
# Verify email
# Login and check console
```

### Step 4: Test Store Creation
Same issue might affect Store creation - verify that works too.

---

## 🧪 Test Checklist

After fixing UserProfile creation:

- [ ] Register new user
- [ ] Verify email
- [ ] Login with username
- [ ] Check dev console - no "No federated jwt" error
- [ ] Verify UserProfile created in DynamoDB (AWS Console)
- [ ] Verify Store created in DynamoDB
- [ ] Check admin dashboard shows correct user data
- [ ] Logout and login again (should use UserProfile table now)

---

## 🚀 Quick Start Commands

```bash
# Terminal 1: Dev Server
cd /Users/edgarcortes/Dev/side-projects/the-sun-pos
pnpm dev

# Terminal 2: Check logs (if needed)
tail -f /tmp/claude/-Users-edgarcortes-Dev-side-projects-the-sun-pos/tasks/*.output

# AWS Console (if needed)
# DynamoDB → Tables → Search for "UserProfile" and "Store"
```

---

## 📍 Current Test User

**Use this to test existing flow:**
- Username: `maria.cortes`
- Email: `marycortezlocutora@gmail.com`
- Password: (you know it)
- Status: Logged in successfully, UserProfile NOT created

**Create NEW user to test fix:**
- Will need different email/username
- Test full flow: register → verify → login

---

## 🎯 Success Criteria

When this is fixed, you should see:

```
✅ Creating UserProfile: {...}
✅ UserProfile created successfully
✅ POST /api/user-profile/create 200
✅ Creating Store: {...}
✅ Store created successfully
✅ POST /api/admin/create-store 200
```

---

## 📂 Key Files

**Must Read:**
1. `src/app/api/user-profile/create/route.ts` - The failing API
2. `src/lib/amplify/auth-helpers.ts` - Calls the API
3. `amplify/data/resource.ts` - Authorization rules

**May Need to Check:**
4. `src/app/api/admin/create-store/route.ts` - Similar issue?
5. `amplify/functions/post-confirmation/handler.ts` - Alternative approach

---

## 💭 Alternative: Move to Lambda

If API approach doesn't work, consider moving UserProfile creation to the `postConfirmation` Lambda trigger:

**Pros:**
- No auth token issues
- Runs automatically on email confirmation
- Server-side, more reliable

**Cons:**
- Need to update Lambda function
- Need to redeploy backend
- More complex to debug

---

## 🔄 After Fix: Next Features

Once UserProfile creation works:

1. **Test Cashier Creation** (30 min)
   - Click "Create Cashier" in admin dashboard
   - Fill form, submit
   - Verify cashier created in Cognito
   - Test cashier login

2. **Implement Transaction Management** (2-3 hours)
   - Create transaction form (cashier dashboard)
   - Store transaction in DynamoDB
   - View transaction history

3. **Store Settings Page** (1 hour)
   - Display store information
   - Edit store name/type
   - Update store in DynamoDB

---

## 📊 Current Architecture

```
Registration Flow:
Register → Cognito signUp → Email Verification → confirmSignUp
  ↓
PostConfirmation Trigger → Add to Admin Group
  ↓
Login Flow:
Login → Cognito signIn → JWT Token (role, storeId)
  ↓
handleFirstLogin() → [FAILS HERE]
  ├─ Create UserProfile → ❌ "No federated jwt"
  └─ Create Store → ❌ (probably same issue)
  ↓
Redirect to Dashboard → ✅ Works (using JWT claims)
```

**Goal:** Get the "FAILS HERE" part working! 🎯

---

**Estimated Time:** 30-60 minutes to fix
**Difficulty:** Medium (debugging auth flow)
**Priority:** High (blocking other features)

---

Good luck! 🚀

**Tip:** Start by reading the error in context - check what authMode is being used and whether the session is properly configured.
