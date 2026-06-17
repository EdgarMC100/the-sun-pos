# Middleware Examples - Route Protection

This document shows concrete examples of how the authentication middleware handles different routes.

## What is `NextResponse.next()`?

**`NextResponse.next()`** continues request processing without modification.

```typescript
// Request comes in → Middleware checks it → NextResponse.next() → Request goes to its destination
const response = NextResponse.next();
return response; // Continue to the target page/API route
```

**`NextResponse.redirect()`** sends the user to a different URL.

```typescript
// Request comes in → Middleware checks it → NextResponse.redirect() → User sent elsewhere
return NextResponse.redirect(new URL('/login', request.url));
```

---

## Example 1: Unauthenticated User Visits Homepage

**Request:** `GET /`

```typescript
// Step 1: Check pathname
pathname = '/'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route)
// publicRoutes = ['/', '/api/auth/resolve-username']
// '/' === '/' ✅ TRUE

// Step 3: Allow access
return NextResponse.next(); // ✅ User sees homepage
```

**Result:** User sees the homepage (no redirect)

---

## Example 2: Unauthenticated User Visits Dashboard

**Request:** `GET /dashboard/admin`

```typescript
// Step 1: Check pathname
pathname = '/dashboard/admin'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route) // ❌ FALSE

// Step 3: Is it an auth route (login/register)?
authRoutes.some((route) => pathname.startsWith(route)) // ❌ FALSE

// Step 4: Is it a protected route?
protectedRoutes.some((route) => pathname.startsWith(route))
// protectedRoutes = ['/dashboard']
// '/dashboard/admin'.startsWith('/dashboard') ✅ TRUE

// Step 5: Check authentication
authenticated = false // User not logged in

// Step 6: Redirect to login
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('redirect', pathname);
return NextResponse.redirect(loginUrl);
// Redirects to: /login?redirect=/dashboard/admin
```

**Result:** User redirected to `/login?redirect=/dashboard/admin`

---

## Example 3: Authenticated User Visits Login Page

**Request:** `GET /login` (User is already logged in)

```typescript
// Step 1: Check pathname
pathname = '/login'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route) // ❌ FALSE

// Step 3: Is it an auth route?
authRoutes.some((route) => pathname.startsWith(route))
// authRoutes = ['/login', '/register']
// '/login'.startsWith('/login') ✅ TRUE

// Step 4: Check authentication
authenticated = true // User is logged in

// Step 5: Redirect to dashboard (already logged in)
return NextResponse.redirect(new URL('/dashboard', request.url));
```

**Result:** User redirected to `/dashboard` (can't view login page when already authenticated)

---

## Example 4: Unauthenticated User Visits Login Page

**Request:** `GET /login` (User is NOT logged in)

```typescript
// Step 1: Check pathname
pathname = '/login'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route) // ❌ FALSE

// Step 3: Is it an auth route?
authRoutes.some((route) => pathname.startsWith(route)) // ✅ TRUE

// Step 4: Check authentication
authenticated = false // User not logged in

// Step 5: Allow access to login page
return response; // NextResponse.next()
```

**Result:** User sees login page (no redirect)

---

## Example 5: Authenticated User Visits Dashboard

**Request:** `GET /dashboard/cashier` (User is logged in as cashier)

```typescript
// Step 1: Check pathname
pathname = '/dashboard/cashier'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route) // ❌ FALSE

// Step 3: Is it an auth route?
authRoutes.some((route) => pathname.startsWith(route)) // ❌ FALSE

// Step 4: Is it a protected route?
protectedRoutes.some((route) => pathname.startsWith(route)) // ✅ TRUE

// Step 5: Check authentication
authenticated = true // User is logged in

// Step 6: Allow access
return response; // NextResponse.next()
```

**Result:** User sees dashboard page (authentication successful)

---

## Example 6: API Route - Username Resolution

**Request:** `POST /api/auth/resolve-username`

```typescript
// Step 1: Check pathname
pathname = '/api/auth/resolve-username'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route)
// publicRoutes = ['/', '/api/auth/resolve-username']
// '/api/auth/resolve-username' === '/api/auth/resolve-username' ✅ TRUE

// Step 3: Allow access (public API)
return NextResponse.next(); // ✅ Continues to API handler
```

**Result:** Request proceeds to API route handler (public endpoint)

---

## Example 7: Authenticated User Visits Register Page

**Request:** `GET /register` (User is already logged in)

```typescript
// Step 1: Check pathname
pathname = '/register'

// Step 2: Is it a public route?
publicRoutes.some((route) => pathname === route) // ❌ FALSE

// Step 3: Is it an auth route?
authRoutes.some((route) => pathname.startsWith(route))
// authRoutes = ['/login', '/register']
// '/register'.startsWith('/login') ❌ FALSE
// '/register'.startsWith('/register') ✅ TRUE

// Step 4: Check authentication
authenticated = true // User is logged in

// Step 5: Redirect to dashboard
return NextResponse.redirect(new URL('/dashboard', request.url));
```

**Result:** User redirected to `/dashboard` (already authenticated, can't register again)

---

## Summary Table

| User State | Route Requested | Middleware Action | Result |
|------------|----------------|-------------------|--------|
| Not logged in | `/` | `NextResponse.next()` | ✅ See homepage |
| Not logged in | `/login` | `NextResponse.next()` | ✅ See login page |
| Not logged in | `/register` | `NextResponse.next()` | ✅ See register page |
| Not logged in | `/dashboard` | `NextResponse.redirect('/login?redirect=/dashboard')` | 🔄 Redirect to login |
| Logged in | `/` | `NextResponse.next()` | ✅ See homepage |
| Logged in | `/login` | `NextResponse.redirect('/dashboard')` | 🔄 Redirect to dashboard |
| Logged in | `/register` | `NextResponse.redirect('/dashboard')` | 🔄 Redirect to dashboard |
| Logged in | `/dashboard` | `NextResponse.next()` | ✅ See dashboard |
| Anyone | `/api/auth/resolve-username` | `NextResponse.next()` | ✅ API processes request |

---

## Key Takeaways

1. **`NextResponse.next()`** = "Continue normally" (no redirect)
   - Used when user has permission to access the route
   - Used for public routes that don't require authentication

2. **`NextResponse.redirect()`** = "Go somewhere else"
   - Used when unauthenticated user tries to access protected routes
   - Used when authenticated user tries to access login/register pages

3. **Middleware runs on EVERY request** matching the matcher config

4. **Order matters:**
   - Public routes checked first (homepage, public APIs)
   - Auth routes checked second (login/register)
   - Protected routes checked last (dashboard)

5. **The `response` variable:**
   ```typescript
   const response = NextResponse.next();
   ```
   This creates a response object that can be modified before returning.
   In our middleware, we pass it to Amplify's server context runner.

---

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Request: GET /dashboard/admin                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Middleware Execution                                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Extract pathname = '/dashboard/admin'                   │
│ 2. Check if public route? ❌                                │
│ 3. Check if auth route? ❌                                  │
│ 4. Check if protected route? ✅ (starts with /dashboard)   │
│ 5. Fetch auth session from Amplify                         │
│ 6. authenticated = false                                    │
│ 7. Build redirect URL: /login?redirect=/dashboard/admin    │
│ 8. Return NextResponse.redirect(loginUrl)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Browser receives 307 redirect                               │
│ Navigates to: /login?redirect=/dashboard/admin             │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing the Middleware

You can test each scenario:

```bash
# Test 1: Public route (no auth needed)
curl http://localhost:3000/

# Test 2: Protected route (should redirect to login)
curl -L http://localhost:3000/dashboard

# Test 3: Login page (unauthenticated - should show login)
curl http://localhost:3000/login

# Test 4: API route (public - should work)
curl -X POST http://localhost:3000/api/auth/resolve-username \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'
```
