# Amplify Gen 2 Integration - Todo List

**Last Updated:** June 16, 2026
**Phase:** Frontend Integration (Phase 5)

---

## ✅ Completed Tasks

1. ✅ Create client-side Amplify configuration (`src/lib/amplify/client.ts`)
2. ✅ Create username resolution API endpoint (`src/app/api/auth/resolve-username/route.ts`)
3. ✅ Create AuthProvider context component (`src/components/auth/AuthProvider.tsx`)
4. ✅ Create route protection middleware (`src/middleware.ts`)

---

## ⏳ Remaining Tasks

### 5. Update root layout to use AuthProvider ← **START HERE**
**File:** `src/app/layout.tsx`

**What to do:**
- Import `AuthProvider` from `@/components/auth/AuthProvider`
- Wrap `{children}` with `<AuthProvider>`
- This enables `useAuth()` hook throughout the app

**Example:**
```tsx
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 6. Create cashier creation form component
**File:** `src/components/forms/CashierCreationForm.tsx`

**What to do:**
- Create form with username and password fields
- Call `createCashier()` from auth-helpers
- Display generated credentials on success
- Admin can print/copy credentials for cashier

---

### 7. Create admin dashboard structure
**Files:**
- `src/app/dashboard/admin/page.tsx` - Main admin dashboard
- `src/app/dashboard/admin/users/create-cashier/page.tsx` - Cashier creation page

**What to do:**
- Show admin-specific navigation
- Display store info
- Link to create cashier page
- Show transaction summary (future)

---

### 8. Create cashier dashboard structure
**File:** `src/app/dashboard/cashier/page.tsx`

**What to do:**
- Create POS interface
- Show cashier username
- Link to create transaction (future)
- Display own transaction history (future)

---

### 9. Update login page for username-based auth
**File:** `src/app/login/page.tsx`

**What to do:**
- Change email field to username field
- Remove email validation, add username validation
- Call `signInWithUsername()` instead of direct `signIn()`
- Handle role-based redirect (admin → /dashboard/admin, cashier → /dashboard/cashier)

---

### 10. Update register page to use registerAdmin helper
**File:** `src/app/register/page.tsx`

**What to do:**
- Add username field
- Keep email field (required for admin recovery)
- Add store name and store type fields
- Call `registerAdmin()` from auth-helpers
- Show email verification prompt

---

## 📊 Progress

**Completed:** 4/10 tasks (40%)
**Remaining:** 6/10 tasks (60%)
**Estimated time:** 2-3 hours

---

## 🚀 Quick Start (Tomorrow)

Just say to Claude Code:
```
Continue with the Amplify Gen 2 integration
```

Or:
```
Start with todo item #5 - Update root layout
```

---

## 📚 Reference Files

**Implementation Plan:** `AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md`
**Product Requirements:** `PRD.md`
**Security Docs:** `docs/security-*.md`
**Continue Guide:** `docs/continue-tomorrow.md`

---

## Notes

- Backend is 100% complete ✅
- All remaining tasks are frontend UI
- Can test incrementally as we build
- No database migrations or breaking changes expected
