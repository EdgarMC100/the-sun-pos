# Amplify Gen 2 Integration - Todo List

**Last Updated:** June 17, 2026
**Phase:** Frontend Integration (Phase 5)

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

---

## ⏳ Remaining Tasks

### 9. Create cashier creation page ← **START HERE TOMORROW**
**File:** `src/app/dashboard/admin/users/create-cashier/page.tsx`

**What to do:**
- Import `CashierCreationForm` component
- Add admin-only protection (check `isAdmin`)
- Add navigation back to admin dashboard
- Simple page layout with form

**Example:**
```tsx
'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { CashierCreationForm } from '@/components/forms/CashierCreationForm';
import Link from 'next/link';

export default function CreateCashierPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div>
      <Link href="/dashboard/admin">← Back to Dashboard</Link>
      <CashierCreationForm />
    </div>
  );
}
```

---

### 10. Create cashier dashboard structure
**File:** `src/app/dashboard/cashier/page.tsx`

**What to do:**
- Create POS interface
- Show cashier username
- Link to create transaction (future)
- Display own transaction history (future)

---

### 11. Update login page for username-based auth
**File:** `src/app/login/page.tsx`

**What to do:**
- Change email field to username field
- Remove email validation, add username validation
- Call `signInWithUsername()` instead of direct `signIn()`
- Handle role-based redirect (admin → /dashboard/admin, cashier → /dashboard/cashier)

---

### 12. Update register page to use registerAdmin helper
**File:** `src/app/register/page.tsx`

**What to do:**
- Add username field
- Keep email field (required for admin recovery)
- Add store name and store type fields
- Call `registerAdmin()` from auth-helpers
- Show email verification prompt

---

## 📊 Progress

**Completed:** 8/12 tasks (67%)
**Remaining:** 4/12 tasks (33%)
**Estimated time:** 1-2 hours

---

## 🚀 Quick Start (Tomorrow)

Just say to Claude Code:
```
continue with the TODO.md
```

Or:
```
Start with task #9 - Create cashier creation page
```

**Next Steps:**
1. Create cashier creation page (wraps the form component)
2. Create cashier dashboard
3. Update login page for username auth
4. Update register page for admin registration

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
