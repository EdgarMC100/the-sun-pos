# Amplify Gen 2 Backend Deployment Session Summary
**Date:** June 22, 2026
**Status:** In Progress - Paused for Tomorrow
**Session Duration:** ~3 hours

---

## 🎯 Session Goal
Deploy AWS Amplify Gen 2 backend with username-based authentication for The Sun Pos POS system.

---

## ✅ What Was Accomplished

### 1. IAM Permissions (COMPLETED ✅)
**Problem:** User `edgarmc` lacked necessary AWS permissions.

**Solution:**
- Created secure IAM policy: `docs/amplify-gen2-secure-policy.json`
- Added permissions for:
  - CloudFormation (stack management)
  - SSM (parameter store for secrets)
  - Cognito, Lambda, DynamoDB, AppSync
  - Restricted `iam:PassRole` to only Amplify/CDK roles with service conditions
- **Status:** ✅ Policy applied and working

### 2. Backend Code Fixes (COMPLETED ✅)

#### a. Auth Trigger Configuration
**File:** `amplify/auth/resource.ts`
- **Fixed:** Removed invalid `triggers: { preTokenGeneration: true, postConfirmation: true }`
- **Added:** Proper function imports and trigger configuration
- **Status:** ✅ Code fixed

#### b. Backend Lambda Permissions
**File:** `amplify/backend.ts`
- **Fixed:** Added `ServicePrincipal` for Cognito invocation permissions
- **Removed:** Duplicate trigger configuration (now in auth/resource.ts)
- **Status:** ✅ Code fixed

### 3. Build Dependencies (COMPLETED ✅)
**Installed:**
- `esbuild@0.28.1` - Lambda function bundler
- `@aws-sdk/client-dynamodb@3.1074.0`
- `@aws-sdk/lib-dynamodb@3.1074.0`
- `@aws-sdk/client-cognito-identity-provider@3.1074.0`
- `@aws-sdk/client-ssm@3.1074.0`

**Why:** Amplify Gen 2 bundles Lambda functions locally using esbuild, requiring all dependencies in `node_modules`.

**Status:** ✅ All dependencies installed

### 4. Lambda Function Handlers (COMPLETED ✅)
**Files:**
- `amplify/functions/post-confirmation/handler.ts` - User setup after email confirmation
- `amplify/functions/pre-token-generation/handler.ts` - Add custom claims to JWT
- `amplify/functions/admin-create-cashier/handler.ts` - Admin creates cashier accounts

**Status:** ✅ All handlers written and ready

---

## ❌ Current Blocker: Circular Dependency

### The Problem
CloudFormation deployment fails with:
```
[CloudformationStackCircularDependencyError]
Circular dependency found between nested stacks
[auth179371D7, data7552DF31, function1351588B]
```

### Why It Happens
```
auth (defines triggers)
  ↓
triggers (postConfirmation writes to DynamoDB)
  ↓
data (Store + UserProfile tables)
  ↓
auth (owner-based authorization requires auth)
  ↑_________________(CIRCLE!)
```

### Root Cause
`postConfirmation` trigger creates BOTH:
1. **Store** record (in data stack)
2. **UserProfile** record (in data stack)

This creates a dependency cycle:
- **Auth needs triggers** to run on user creation
- **Triggers need data** to write Store/UserProfile
- **Data needs auth** for authorization rules

---

## 🔧 Proposed Solutions for Tomorrow

### Option A: Simplify postConfirmation (RECOMMENDED ⭐)
**Change:**
- Remove Store creation from `postConfirmation` trigger
- Admin creates Store via API call AFTER registration
- Keeps UserProfile creation in trigger (necessary for auth)

**Pros:**
- Breaks circular dependency
- More flexible (admin can customize store details)
- Minimal code changes

**Implementation:**
1. Edit `amplify/functions/post-confirmation/handler.ts`
2. Remove Store creation logic (lines 56-76)
3. Create API endpoint for Store creation
4. Update registration flow to call API after email verification

**Time:** 10-15 minutes

---

### Option B: Remove Triggers Entirely
**Change:**
- No Cognito triggers
- Use API endpoints for all user setup
- Call APIs after registration/creation

**Pros:**
- No circular dependencies
- More control over setup process
- Easier to debug

**Cons:**
- More frontend code
- Extra API calls after auth

**Time:** 30-60 minutes

---

### Option C: Report as Amplify Bug
**Action:**
- Document issue
- Report to: https://github.com/aws-amplify/amplify-backend/issues
- Wait for Amplify team guidance

**Pros:**
- Might be a known issue with workaround
- Helps community

**Cons:**
- No immediate solution
- May take days/weeks

---

## 📁 Files Modified During Session

### Created
- `docs/aws-permissions-required.md` - IAM permission guide
- `docs/amplify-gen2-secure-policy.json` - Secure IAM policy
- `docs/SESSION_SUMMARY_2026-06-22.md` - This file

### Modified
- `amplify/auth/resource.ts` - Fixed trigger configuration
- `amplify/backend.ts` - Fixed Lambda permissions
- `amplify/functions/post-confirmation/resource.ts` - Resource group attempts
- `amplify/functions/pre-token-generation/resource.ts` - Resource group attempts
- `amplify/functions/admin-create-cashier/resource.ts` - Resource group attempts
- `package.json` - Added esbuild + AWS SDK dependencies
- `pnpm-lock.yaml` - Dependency lockfile

### Unchanged (Ready to Use)
- All Lambda handler code (`handler.ts` files)
- Data schema (`amplify/data/resource.ts`)
- Frontend code (login, register, dashboards)

---

## 🔍 What We Learned

### 1. Amplify Gen 2 Bundling
- Uses esbuild to bundle Lambda functions locally
- Requires all dependencies in `node_modules`
- Creates self-contained `.mjs` files for deployment

### 2. IAM PassRole Security
- Never use wildcards with `iam:PassRole`
- Always restrict to specific roles and services
- Use `iam:PassedToService` condition for extra security

### 3. Amplify Sandbox Behavior
- File changes trigger automatic redeployment
- Can cause stale state issues if files change during deployment
- Best practice: finalize all code before starting sandbox

### 4. CloudFormation Circular Dependencies
- Amplify uses nested stacks (auth, data, function)
- Cross-stack references can create circular dependencies
- `resourceGroupName` assigns functions to specific stacks

---

## 📊 Current State

### ✅ Working
- All backend code written
- All frontend UI complete
- IAM permissions configured
- Dependencies installed

### ❌ Not Working
- Backend deployment (blocked by circular dependency)
- Cannot test authentication flows

### ⏸️ Paused
- Amplify sandbox stopped
- No active deployments
- Clean `.amplify` cache

---

## 🚀 Tomorrow's Action Plan

### Step 1: Choose Solution
Recommend **Option A** (simplify postConfirmation)

### Step 2: Implement Fix
1. Remove Store creation from postConfirmation
2. Keep UserProfile creation
3. Test deployment

### Step 3: Deploy Sandbox
```bash
rm -rf .amplify
npx ampx sandbox
```

### Step 4: Verify Deployment
1. Check `amplify_outputs.json` for real values
2. Verify Cognito User Pool created
3. Verify Lambda functions deployed
4. Verify DynamoDB tables exist

### Step 5: Test Authentication
1. Register admin account
2. Verify email
3. Login with username
4. Create cashier account
5. Login as cashier

---

## 🐛 Known Issues

### 1. Duplicate Construct Error
**Error:** `There is already a Construct with name 'userPoolId'`

**When:** Occurs when files change after sandbox starts

**Workaround:**
- Delete sandbox: `npx ampx sandbox delete --yes`
- Clear cache: `rm -rf .amplify`
- Restart: `npx ampx sandbox`

### 2. Node Version Warning
**Warning:** AWS SDK requires Node >=22 (running v20.20.2)

**Impact:** Warnings only, functionality works

**Fix (Optional):** Upgrade to Node.js 22+

---

## 📚 Reference Documents

1. **Product Requirements:** `PRD.md`
2. **Implementation Plan:** `AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md`
3. **Project Context:** `CLAUDE.md`
4. **Frontend Guidelines:** `.claude/agents/frontend-agents.md`
5. **IAM Permissions:** `docs/aws-permissions-required.md`
6. **Secure Policy:** `docs/amplify-gen2-secure-policy.json`

---

## 💡 Key Takeaways

1. **Amplify Gen 2 is different** - Uses new patterns, check docs before assuming
2. **Security first** - IAM policies should be restrictive, not permissive
3. **Circular dependencies are tricky** - Plan stack dependencies carefully
4. **Patience pays off** - Complex deployments take time to debug

---

## 🎯 Success Criteria (When Complete)

- [ ] Amplify sandbox deploys successfully
- [ ] `amplify_outputs.json` contains real AWS resource IDs
- [ ] Admin can register with email
- [ ] Admin can login with username
- [ ] Admin can create cashier accounts
- [ ] Cashier can login with username (no email)
- [ ] Role-based dashboard redirects work
- [ ] Multi-tenant data isolation verified

---

**Next Session:** Continue with Option A (simplify postConfirmation)
**Expected Time:** 30-60 minutes to deploy and test
**Confidence:** High - solution is clear, just needs implementation

---

**Good work today! We made significant progress on IAM, dependencies, and backend code. Tomorrow we'll resolve the circular dependency and get the backend deployed. 🚀**
