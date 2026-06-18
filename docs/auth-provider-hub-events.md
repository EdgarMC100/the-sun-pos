# AuthProvider & Hub Events - Complete Guide

**Last Updated:** June 17, 2026
**Topic:** Understanding React Context, AWS Amplify Hub Events, and Component Re-rendering

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [AuthProvider & useAuth Hook](#authprovider--useauth-hook)
3. [AWS Amplify Hub Events](#aws-amplify-hub-events)
4. [How Components Re-Render](#how-components-re-render)
5. [Real-World Examples](#real-world-examples)
6. [Debugging & Testing](#debugging--testing)

---

## Overview

This document explains how authentication state is managed throughout The Sun Pos application using:

- **React Context** - Share state across the entire app
- **AuthProvider** - Component that manages auth state
- **useAuth() Hook** - Access auth state from any component
- **Amplify Hub** - Event system for auth state changes
- **Re-render Mechanism** - How components update automatically

### Architecture Overview

```
Root Layout (layout.tsx)
    └── <AuthProvider>          ← Wraps entire app
            ├── Dashboard
            │   └── useAuth()   ← Access auth state
            ├── Navbar
            │   └── useAuth()   ← Access auth state
            └── Profile
                └── useAuth()   ← Access auth state
```

---

## AuthProvider & useAuth Hook

### How It Works

AuthProvider uses the **React Context Pattern** to share authentication state across your entire app without prop drilling.

### Implementation

```tsx
// src/components/auth/AuthProvider.tsx

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUserData } from '@/lib/amplify/auth-helpers';

interface AuthContextType {
  user: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isCashier: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data
  const loadUser = async () => {
    try {
      const userData = await getCurrentUserData();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load (ONCE on app mount)
  useEffect(() => {
    loadUser();
  }, []);

  // Listen to Hub events for updates
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          loadUser();
          break;
        case 'signedOut':
          setUser(null);
          break;
        case 'tokenRefresh':
          loadUser();
          break;
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isCashier: user?.role === 'cashier',
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Usage Examples

#### Example 1: Protect Admin Route

```tsx
'use client';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  if (!isAdmin) return <div>Access denied</div>;

  return <div>Welcome Admin: {user.username}</div>;
}
```

#### Example 2: Show User Info in Navbar

```tsx
function Navbar() {
  const { user, isAdmin, isCashier } = useAuth();

  return (
    <nav>
      {user && <span>Logged in as: {user.username}</span>}
      {isAdmin && <Link href="/admin">Admin Panel</Link>}
      {isCashier && <Link href="/pos">POS</Link>}
    </nav>
  );
}
```

#### Example 3: Conditional Rendering

```tsx
function Dashboard() {
  const { isAdmin, isCashier } = useAuth();

  return (
    <div>
      {isAdmin && <AdminDashboard />}
      {isCashier && <CashierPOS />}
    </div>
  );
}
```

### Key Benefits

| Benefit | Explanation |
|---------|-------------|
| **Single Source of Truth** | User state stored in ONE place (AuthProvider) |
| **Auto-Updates** | When user logs in/out, ALL components update automatically |
| **Type-Safe** | TypeScript ensures correct data shape |
| **Easy to Use** | Just call `useAuth()` - no prop drilling needed |
| **Event-Driven** | Listens to Amplify Hub for auth state changes |

---

## AWS Amplify Hub Events

### What is Amplify Hub?

**Hub** is Amplify's **event broadcasting system**. Think of it as a notification system for your app.

```
Amplify                          Your Code
(Publisher)                      (Subscriber)
    │                                 │
    │  User logs in                   │
    │  ↓                               │
    │  Broadcast: "signedIn"          │
    │  ───────────────────────────>   │
    │                                  │ AuthProvider hears it
    │                                  │ ↓ Runs loadUser()
    │                                  │ ↓ Updates state
```

### The Publish/Subscribe Pattern

- 📻 **Amplify** = Radio station (broadcasts events)
- 👂 **Your code** = Radio listener (receives events)

### Available Auth Events

| Event | When It Fires | What You Should Do |
|-------|---------------|-------------------|
| `signedIn` | User successfully logs in | Fetch user data, redirect to dashboard |
| `signedOut` | User logs out | Clear user state, redirect to login |
| `tokenRefresh` | JWT token auto-renews (~55 min) | Reload user data to get fresh claims |
| `tokenRefresh_failure` | Token refresh fails | User needs to re-login |
| `signInWithRedirect` | OAuth/social login completes | Load user data |
| `customOAuthState` | Custom OAuth flow data | Handle OAuth state |

### Real-World Timeline: User Logs In

#### Step 1: User Submits Login Form
```tsx
// LoginPage.tsx
const handleLogin = async () => {
  await signInWithUsername('maria.owner', 'password123');
  // ↓ Amplify processes this
};
```

#### Step 2: Amplify Processes Login (Behind the Scenes)
```
1. Amplify sends credentials to Cognito
2. Cognito validates username/password
3. Cognito returns JWT tokens
4. Amplify stores tokens
5. Amplify broadcasts: "signedIn" event
```

#### Step 3: Hub Broadcasts Event
```tsx
// Amplify internally does:
Hub.dispatch('auth', {
  event: 'signedIn',
  data: { /* user info */ }
});
```

#### Step 4: AuthProvider Hears the Broadcast
```tsx
Hub.listen('auth', ({ payload }) => {
  if (payload.event === 'signedIn') {
    loadUser(); // ← THIS RUNS!
  }
});
```

#### Step 5: loadUser() Fetches Fresh Data
```tsx
const loadUser = async () => {
  setLoading(true);
  const userData = await getCurrentUserData();
  setUser(userData); // ← STATE UPDATED!
  setLoading(false);
};
```

#### Step 6: All Components Re-render
```tsx
function Dashboard() {
  const { user } = useAuth(); // ← user is now populated!
  return <div>Welcome {user.username}</div>;
}
```

### Why Not Check User State Manually?

**❌ BAD: Manual checking on every page**
```tsx
function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // This runs on EVERY page load - inefficient!
    fetchUser().then(setUser);
  }, []);
}
```

**Problems:**
- Fetches user data multiple times
- State not synchronized across pages
- Misses real-time events (logout in another tab)
- Code duplication

**✅ GOOD: Hub + AuthProvider**
```tsx
// Fetch ONCE on mount, listen to events for updates
function AuthProvider() {
  useEffect(() => {
    loadUser(); // Only once!
  }, []);

  useEffect(() => {
    Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') loadUser();
      if (payload.event === 'signedOut') setUser(null);
    });
  }, []);
}
```

**Benefits:**
- ✅ User data fetched **only once** on app load
- ✅ **Automatically updates** when auth state changes
- ✅ **Shared state** across all components
- ✅ **Event-driven** - reacts to changes instantly

---

## How Components Re-Render

### The Re-render Chain Reaction

When `setUser()` is called in AuthProvider:

```
setUser(newData)  →  AuthProvider re-renders  →  Context value changes  →
All components using useContext(AuthContext) re-render
```

### Step-by-Step Mechanism

#### Step 1: AuthProvider Has State

```tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // ← STATE LIVES HERE

  const value = {
    user,        // ← Value from state
    loading,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

#### Step 2: Components Subscribe via useContext

```tsx
function Dashboard() {
  const { user } = useAuth(); // ← Calls useContext(AuthContext)
  return <div>{user?.username}</div>;
}
```

**What `useContext()` does:**
- Tells React: "I want to **watch** this Context"
- React adds component to **subscriber list**
- Whenever Context value changes, React **re-renders** all subscribers

#### Step 3: setUser() Triggers Re-Render

```tsx
const loadUser = async () => {
  const userData = await getCurrentUserData();
  setUser(userData); // ← THIS IS THE TRIGGER
};
```

**What happens internally:**

```
1. setUser(userData) is called
   ↓
2. React detects state change in AuthProvider
   ↓
3. React re-renders AuthProvider component
   ↓
4. AuthProvider creates NEW value object:
   value = { user: userData, loading: false, isAdmin: true }
   ↓
5. <AuthContext.Provider value={value}> receives NEW value
   ↓
6. React compares old value vs new value (reference changed!)
   ↓
7. React notifies ALL subscribers: "Context changed!"
   ↓
8. React re-renders EVERY component that called useContext(AuthContext)
```

### Visual Timeline Example

**Initial State (App Just Loaded)**

```tsx
// AuthProvider state
user = null
loading = true

// Dashboard component
const { user, loading } = useAuth();
// Renders: <div>Loading...</div>
```

**User Logs In (setUser Called)**

```tsx
// Hub emits 'signedIn' → loadUser() → setUser(userData)

// NEW AuthProvider state
user = { username: 'maria.owner', role: 'admin', storeId: '123' }
loading = false

// Dashboard re-renders with NEW data
const { user, loading } = useAuth();
// Renders: <div>Welcome maria.owner</div>
```

### Why This Is Efficient

**Only subscribers re-render:**

```tsx
<App>
  <AuthProvider>
    <Dashboard />        ← Uses useAuth() → RE-RENDERS
    <Navbar />           ← Uses useAuth() → RE-RENDERS
    <Footer />           ← Does NOT use useAuth() → NO RE-RENDER
    <AdBanner />         ← Does NOT use useAuth() → NO RE-RENDER
  </AuthProvider>
</App>
```

When `setUser()` is called:
- ✅ Dashboard and Navbar re-render (they use `useAuth()`)
- ✅ Footer and AdBanner don't re-render (they don't use `useAuth()`)

### Newspaper Analogy

Think of it like a **newspaper subscription**:

- **AuthProvider** = Newspaper Publisher
  - Has the news (user data)
  - Sends updates when news changes

- **useAuth()** = Newspaper Subscription
  - Components "subscribe" by calling `useAuth()`
  - Get notified whenever there's new news

- **setUser()** = Publishing New Edition
  - Prints new newspaper (new state)
  - Delivers to ALL subscribers automatically

```
Publisher (AuthProvider)
  ↓ setUser(newData) → New edition published!
  ↓
Delivers to subscribers:
  → Dashboard (gets new data, re-renders)
  → Navbar (gets new data, re-renders)
  → Profile (gets new data, re-renders)
```

---

## Real-World Examples

### Scenario 1: User Logs In

```
User enters username/password → Click "Login"
    ↓
Amplify: signIn() validates credentials
    ↓
Hub broadcasts: "signedIn"
    ↓
AuthProvider hears it → loadUser()
    ↓
Dashboard shows: "Welcome maria.owner"
```

### Scenario 2: User Logs Out

```
User clicks "Logout" button
    ↓
Amplify: signOut() clears tokens
    ↓
Hub broadcasts: "signedOut"
    ↓
AuthProvider hears it → setUser(null)
    ↓
App redirects to login page
```

### Scenario 3: Token Auto-Refresh (Background)

```
55 minutes pass (token about to expire)
    ↓
Amplify: Automatically refreshes token with Cognito
    ↓
Hub broadcasts: "tokenRefresh"
    ↓
AuthProvider hears it → loadUser() (gets fresh claims)
    ↓
User stays logged in seamlessly
```

### Scenario 4: User Logs Out in Another Tab

```
Tab 1: User browsing dashboard
Tab 2: User clicks logout
    ↓
Hub broadcasts: "signedOut" (to ALL tabs!)
    ↓
Tab 1's AuthProvider hears it → setUser(null)
    ↓
Tab 1 automatically redirects to login
```

---

## Debugging & Testing

### Enable Debug Logging

Add this to see ALL Hub events:

```tsx
// In AuthProvider.tsx (for debugging)
useEffect(() => {
  const unsubscribe = Hub.listen('auth', ({ payload }) => {
    console.log('🔔 Hub Event:', payload.event, payload);
  });
  return unsubscribe;
}, []);
```

### Add Component Render Logging

```tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  console.log('🔄 AuthProvider rendering, user:', user);

  // ... rest of code
}

function Dashboard() {
  const { user } = useAuth();
  console.log('🏠 Dashboard rendering, user:', user);

  return <div>{user?.username}</div>;
}
```

### Expected Console Output (Login Flow)

```
// Initial render (app loads)
🔄 AuthProvider rendering, user: null
🏠 Dashboard rendering, user: null

// User clicks login
🔔 Hub Event: signedIn { /* data */ }
✅ User signed in
🔄 AuthProvider rendering, user: { username: 'maria.owner', role: 'admin' }
🏠 Dashboard rendering, user: { username: 'maria.owner', role: 'admin' }
```

---

## Key Takeaways

### "Only once on app mount" Explained

**Question:** *"Is user data fetched on every page load?"*

**Answer:**

1. **On App Mount (ONCE):**
   ```tsx
   useEffect(() => {
     loadUser(); // ← Fetches user data ONE TIME
   }, []); // Empty array = runs only on mount
   ```

2. **After That (Event-Driven):**
   ```tsx
   Hub.listen('auth', ({ payload }) => {
     // Only updates when events happen
   });
   ```

**So:**
- ✅ Navigate `/dashboard` → `/profile` → `/settings` = **NO re-fetch** (uses cached state)
- ✅ User logs out = Hub event → **State cleared** instantly
- ✅ Token expires = Hub event → **Auto-refresh** → State updated
- ✅ Hard refresh page (F5) = **Re-fetch** (app remounts)

### Re-Render Summary

**Q: How does `setUser()` cause components to re-render?**

**A: Four-step chain reaction:**

1. **`setUser(newData)`** → Updates state in AuthProvider
2. **AuthProvider re-renders** → Creates new `value` object
3. **Context value changes** → React detects new object reference
4. **All subscribers re-render** → Components using `useContext()` get new data

**In code:**
```tsx
setUser(newData)
  ↓
AuthProvider re-renders
  ↓
value = { user: newData, ... } ← NEW object
  ↓
<AuthContext.Provider value={value}> ← NEW value
  ↓
React: "Value changed! Notify subscribers!"
  ↓
useAuth() components re-render with new data
```

---

## References

- **File Location:** `src/components/auth/AuthProvider.tsx`
- **Auth Helpers:** `src/lib/amplify/auth-helpers.ts`
- **Amplify Hub Docs:** https://docs.amplify.aws/lib/utilities/hub/
- **React Context Docs:** https://react.dev/reference/react/useContext

---

**Last Updated:** June 17, 2026
**Maintained by:** Edgar Cortes
