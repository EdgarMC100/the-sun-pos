# Continue Tomorrow - Amplify Gen 2 Integration

## Current Progress ✅

### Completed:
1. ✅ Client-side Amplify configuration (`src/lib/amplify/client.ts`)
2. ✅ Username resolution API (`src/app/api/auth/resolve-username/route.ts`)
3. ✅ AuthProvider context component (`src/components/auth/AuthProvider.tsx`)
4. ✅ Route protection middleware (`src/middleware.ts`)

### Remaining Tasks:
1. ⏳ **Update root layout to use AuthProvider** ← START HERE TOMORROW
2. ⏳ Create cashier creation form component
3. ⏳ Create admin dashboard structure
4. ⏳ Create cashier dashboard structure
5. ⏳ Update login page for username-based auth
6. ⏳ Update register page to use registerAdmin helper

---

## Next Task: Update Root Layout

### File to Edit:
`src/app/layout.tsx`

### What to Do:
Wrap the app with `AuthProvider` to make authentication state available throughout the app.

### Changes Needed:

**Current code:**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
```

**Updated code:**
```tsx
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

### Why This Matters:
- Makes `useAuth()` hook available in all components
- Tracks authentication state globally
- Enables automatic redirects based on auth state

---

## How to Continue Tomorrow

### Option 1: Short Command
Just say:
```
Continue with the Amplify Gen 2 integration
```

### Option 2: Be Specific
```
Start with updating the root layout to use AuthProvider
```

### Option 3: Reference the Todo
```
Continue with todo item #5
```

---

## Files We've Created (Reference)

### Backend (Already Complete):
- `amplify/backend.ts` - Main backend definition
- `amplify/auth/resource.ts` - Cognito config
- `amplify/data/resource.ts` - Data schemas
- `amplify/functions/post-confirmation/handler.ts` - User setup trigger
- `amplify/functions/pre-token-generation/handler.ts` - Custom claims
- `amplify/functions/admin-create-cashier/handler.ts` - Cashier creation

### Frontend (In Progress):
- ✅ `src/lib/amplify/client.ts` - Client config
- ✅ `src/lib/amplify/server.ts` - Server config
- ✅ `src/lib/amplify/auth-helpers.ts` - Auth utilities
- ✅ `src/app/api/auth/resolve-username/route.ts` - Username resolver
- ✅ `src/components/auth/AuthProvider.tsx` - Auth context
- ✅ `src/middleware.ts` - Route protection

### Still To Create:
- ⏳ Update `src/app/layout.tsx` - Add AuthProvider
- ⏳ `src/components/forms/CashierCreationForm.tsx` - Cashier form
- ⏳ `src/app/dashboard/page.tsx` - Role-based redirect
- ⏳ `src/app/dashboard/admin/page.tsx` - Admin dashboard
- ⏳ `src/app/dashboard/admin/users/create-cashier/page.tsx` - Cashier creation page
- ⏳ `src/app/dashboard/cashier/page.tsx` - Cashier POS
- ⏳ Update `src/app/login/page.tsx` - Username-based login
- ⏳ Update `src/app/register/page.tsx` - Admin registration

---

## Quick Reference

### Implementation Plan:
See `AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md` for full details

### Security Documentation:
- `docs/security-jwt-tokens.md` - JWT security explanation
- `docs/security-layers-summary.md` - Security overview
- `docs/middleware-examples.md` - Middleware examples

### PRD (Product Requirements):
See `PRD.md` for feature specifications

---

## Estimated Time Remaining

- ✅ Phase 1-4: Complete (Backend, Auth, Middleware)
- ⏳ Phase 5: Role-based UI (~2-3 hours)
  - Update layouts and dashboards
  - Create forms
  - Update login/register pages
- ⏳ Phase 6: Testing & Deployment (~1-2 hours)

**Total remaining:** ~3-5 hours of work

---

## When You Return Tomorrow

1. Open your terminal in the project directory
2. Start a new Claude Code session
3. Say: **"Continue with the Amplify Gen 2 integration"**
4. I'll pick up right where we left off! 🚀

---

## Notes

- All backend infrastructure is set up ✅
- Security layers are implemented ✅
- Next steps are all frontend UI/UX work
- No breaking changes expected
- Can test incrementally as we build

---

**Last Updated:** June 16, 2026
**Current Phase:** Frontend Integration (Phase 5)
**Next Task:** Update root layout with AuthProvider
