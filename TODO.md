# Amplify Gen 2 Integration - Todo List

**Last Updated:** June 19, 2026
**Phase:** Frontend Integration Complete - Backend Deployment Pending

---

## ⚠️ IMPORTANT: Backend Not Deployed Yet

The `amplify_outputs.json` file contains **PLACEHOLDER** values. The backend code is written but not deployed to AWS.

**To deploy:**
```bash
# Development (local sandbox)
npx ampx sandbox

# Production (AWS deployment)
npx ampx pipeline-deploy --branch main
```

**Current State:**
- ✅ Backend code written (auth, data, functions)
- ✅ Frontend UI complete
- ❌ Backend NOT deployed to AWS
- ❌ Cannot register/login yet (no Cognito User Pool)

---

## ✅ Completed Tasks

1. ✅ Create client-side Amplify configuration (`src/lib/amplify/client.ts`)
2. ✅ Create username resolution API endpoint (`src/app/api/auth/resolve-username/route.ts`)
3. ✅ Create AuthProvider context component (`src/components/auth/AuthProvider.tsx`)
4. ✅ Create route protection middleware (`src/middleware.ts`)
5. ✅ Update root layout to use AuthProvider (`src/app/layout.tsx`)
6. ✅ Create cashier creation form component (`src/components/forms/CashierCreationForm.tsx` + CSS module)
7. ✅ Create admin dashboard page (`src/app/dashboard/admin/page.tsx` + CSS module)
8. ✅ Create comprehensive AuthProvider & Hub Events documentation (`docs/auth-provider-hub-events.md`)
9. ✅ Create cashier creation page (`src/app/dashboard/admin/users/create-cashier/page.tsx` + CSS module)
10. ✅ Create cashier dashboard structure (`src/app/dashboard/cashier/page.tsx` + CSS module)
11. ✅ Update login page for username-based auth (`src/app/login/page.tsx` + CSS updates)
12. ✅ Update register page to use registerAdmin helper (`src/app/register/page.tsx` - already implemented)

---

## 📊 Progress

**Frontend Integration:** 12/12 tasks (100%) ✅
**Backend Deployment:** 0/5 tasks (0%) ⏳
**Overall Status:** Frontend complete, backend deployment needed

---

## 🎯 What Was Accomplished

### Authentication & Authorization
- ✅ Username-based login (no email required for cashiers)
- ✅ Admin self-registration with email verification
- ✅ Role-based authentication (Admin/Cashier)
- ✅ Route protection middleware
- ✅ AuthProvider with Hub events integration

### User Interface
- ✅ Login page updated for username authentication
- ✅ Register page with admin registration flow
- ✅ Admin dashboard with user management
- ✅ Cashier creation page and form
- ✅ Cashier POS dashboard (ready for transactions)

### Code Quality
- ✅ Followed frontend agent guidelines (grouped state, error handling)
- ✅ CSS Modules with simplified naming (no BEM)
- ✅ TypeScript interfaces for all forms
- ✅ Responsive design (mobile-first)
- ✅ Loading and error states

---

## ⏳ Backend Deployment Tasks (Phase 6)

### 1. Deploy Amplify Backend
**Command:** `npx ampx sandbox`

**What it does:**
- Creates Cognito User Pool with custom attributes (role, storeId)
- Creates User Groups (Admin, Cashier)
- Deploys Lambda functions (postConfirmation, preTokenGeneration, adminCreateCashier)
- Creates DynamoDB tables (Store, UserProfile, Transaction)
- Generates real `amplify_outputs.json` with actual AWS resource IDs

**Verify:**
- [ ] `amplify_outputs.json` has real values (not PLACEHOLDER)
- [ ] AWS Console shows Cognito User Pool created
- [ ] Lambda functions deployed
- [ ] DynamoDB tables exist

---

### 2. Test Admin Registration Flow
**Steps:**
1. Run `pnpm dev`
2. Visit `http://localhost:3000/register`
3. Fill out registration form
4. Submit and verify email sent
5. Confirm email with verification code
6. Login with username and password
7. Verify redirect to `/dashboard/admin`

**Verify:**
- [ ] Registration succeeds
- [ ] Email verification code received
- [ ] Can login with username (not email)
- [ ] Redirected to admin dashboard
- [ ] User exists in Cognito with custom attributes
- [ ] Store record created in DynamoDB
- [ ] UserProfile record created

---

### 3. Test Cashier Creation Flow
**Steps:**
1. Login as admin
2. Navigate to `/dashboard/admin/users/create-cashier`
3. Create cashier with username + password
4. Note the generated credentials
5. Logout
6. Login as cashier with username and password
7. Verify redirect to `/dashboard/cashier`

**Verify:**
- [ ] Cashier user created with internal email format
- [ ] No verification email sent to cashier
- [ ] Cashier can login immediately
- [ ] Cashier redirected to cashier dashboard
- [ ] Cashier has correct custom attributes (role, storeId)
- [ ] Cashier linked to admin's store

---

### 4. Test Multi-Tenant Isolation
**Steps:**
1. Create second admin account (different email)
2. Login as Admin 1 and create cashiers
3. Login as Admin 2 and create cashiers
4. Verify Admin 1 cannot see Admin 2's data

**Verify:**
- [ ] Each admin has unique storeId
- [ ] Admins see only their own cashiers
- [ ] Cashiers see only their own store's data
- [ ] No data leakage between stores

---

### 5. Test Username Resolution
**Steps:**
1. Test username → email resolution API
2. Test login with username (not email)
3. Verify internal email never displayed

**Command to test API:**
```bash
curl -X POST http://localhost:3000/api/auth/resolve-username \
  -H "Content-Type: application/json" \
  -d '{"username":"your.username"}'
```

**Verify:**
- [ ] API returns correct email for username
- [ ] Login page accepts username (not email field)
- [ ] Internal cashier email never shown in UI
- [ ] `preferred_username` displayed instead

---

## 🚀 Future Tasks (Phase 7+)

### Phase 7: Transaction Management (Future)
1. Create transaction form component
2. Add product catalog management
3. Implement transaction history views
4. Add cashier transaction creation

### Phase 7: Testing & Deployment
1. Test admin registration flow
2. Test cashier creation and login
3. Verify role-based redirects
4. Deploy to AWS Amplify
5. End-to-end testing

### Phase 8: Polish & Features
1. Add offline support (DataStore sync)
2. Implement password reset for admins
3. Add user activity logs
4. Create reporting dashboard

---

## 📚 Reference Files

**Implementation Plan:** `AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md`
**Product Requirements:** `PRD.md`
**Project Context:** `CLAUDE.md`
**Frontend Guidelines:** `.claude/agents/frontend-agents.md`

---

## 📝 Status Summary

**Completed on June 19, 2026:**
- ✅ All 12 frontend integration tasks
- ✅ Backend code written (auth, data, Lambda functions)
- ✅ Username-based authentication UI
- ✅ Admin and cashier dashboards
- ✅ Role-based routing and protection

**What Works Now:**
- UI is fully functional and responsive
- Forms validate correctly
- Navigation and routing work
- Frontend calls auth helpers correctly

**What Doesn't Work Yet:**
- ❌ Cannot actually register (no Cognito User Pool)
- ❌ Cannot login (backend not deployed)
- ❌ Auth helpers will fail (no AWS resources)
- ❌ API endpoints won't work (no Lambda functions)

**Next Action Required:**
Run `npx ampx sandbox` to deploy the backend and test the full authentication flow.

**Once Backend Deployed:**
The application will have a complete, working authentication system with username-based login for both admins and cashiers, multi-tenant isolation, and role-based access control.
