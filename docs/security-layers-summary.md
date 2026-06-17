# Security Layers Summary

## Your Concern: "Can someone modify session.tokens?"

**Short Answer:** No - Multiple security layers prevent this.

---

## All Security Layers (Defense in Depth)

### Layer 1: HTTP-Only Cookies 🍪
**What it does:** Prevents JavaScript from accessing tokens

```typescript
// ❌ ATTACKER TRIES:
document.cookie // Returns: "" (empty - cannot access httpOnly cookies)
localStorage.getItem('idToken') // null (not stored in localStorage)

// ✅ ONLY THE BROWSER CAN:
// - Include cookie in HTTP requests automatically
// - Cookie flagged: httpOnly=true, secure=true, sameSite=strict
```

**Protection:** XSS (Cross-Site Scripting) attacks cannot steal tokens

---

### Layer 2: HTTPS Encryption 🔐
**What it does:** Encrypts all network traffic

```
Client → HTTPS → AWS Amplify Server
         ^^^^^
         Encrypted with TLS 1.3
```

**Protection:** Man-in-the-middle attacks cannot intercept tokens

---

### Layer 3: JWT Signature Verification ✍️
**What it does:** Cryptographically verifies token authenticity

```typescript
// Inside fetchAuthSession():
const [header, payload, signature] = token.split('.');

// Step 1: Fetch Cognito public key
const publicKey = await getCognitoPublicKey(userPoolId);

// Step 2: Verify signature
const isValid = crypto.verify(
  'RSA-SHA256',
  `${header}.${payload}`,
  signature,
  publicKey
);

if (!isValid) {
  throw new Error('Invalid signature'); // ❌ Token rejected
}
```

**How signatures work:**
```
AWS Cognito (has private key)
    ↓
Creates token: sign(header + payload, PRIVATE_KEY) → signature
    ↓
Your app (has public key)
    ↓
Verifies token: verify(header + payload, signature, PUBLIC_KEY) → true/false
```

**Protection:** Token tampering detection
- Change payload → signature becomes invalid
- Create fake token → cannot sign without Cognito's private key

---

### Layer 4: Token Expiration ⏰
**What it does:** Tokens automatically expire

```typescript
// Inside fetchAuthSession():
const now = Math.floor(Date.now() / 1000);
const expiration = payload.exp;

if (now > expiration) {
  throw new Error('Token expired'); // ❌ Token rejected
}
```

**Configuration:**
- ID Token: 1 hour (default)
- Refresh Token: 30 days (default)

**Protection:** Stolen tokens have limited lifetime

---

### Layer 5: Issuer Verification 🏢
**What it does:** Ensures token came from your Cognito User Pool

```typescript
// Inside fetchAuthSession():
const expectedIssuer = `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ABC123`;

if (payload.iss !== expectedIssuer) {
  throw new Error('Invalid issuer'); // ❌ Token rejected
}
```

**Protection:** Tokens from other Cognito pools rejected

---

### Layer 6: Custom Claims Validation ✅
**What it does:** Ensures token has required application-specific claims

```typescript
// In our enhanced middleware:
const hasRole = payload['custom:role'] &&
               ['admin', 'cashier'].includes(payload['custom:role']);
const hasStoreId = !!payload['custom:storeId'];

if (!hasRole || !hasStoreId) {
  authenticated = false; // ❌ Invalid token structure
}
```

**Protection:** Tokens without proper claims (e.g., test tokens, old tokens) rejected

---

## Complete Attack Analysis

### Attack: Modify Token Payload

**Attacker Action:**
```javascript
// 1. Get token from network inspector (can't get from cookie - httpOnly)
// Let's say they intercept it over network somehow
const token = "eyJhbG...header.eyJzdWI...payload.SflKxw...signature";

// 2. Decode payload (Base64 is NOT encryption, just encoding)
const [h, p, s] = token.split('.');
const payload = JSON.parse(atob(p));
// { "custom:role": "cashier", ... }

// 3. Modify payload
payload["custom:role"] = "admin"; // ⚠️ ATTEMPT TO ESCALATE PRIVILEGES

// 4. Create new token
const newPayload = btoa(JSON.stringify(payload));
const modifiedToken = `${h}.${newPayload}.${s}`;

// 5. Use modified token
fetch('/dashboard/admin', {
  headers: { Cookie: `idToken=${modifiedToken}` }
});
```

**What Happens:**
```typescript
// Middleware runs:
const session = await fetchAuthSession(contextSpec);

// fetchAuthSession() internally:
const [header, payload, signature] = modifiedToken.split('.');

// Verify signature
const dataToVerify = `${header}.${payload}`;
//                                   ^^^^^ MODIFIED (different from original)
const isValid = crypto.verify(dataToVerify, signature, cognitoPublicKey);
//                                           ^^^^^^^^^  ORIGINAL (created for original payload)

// Result: isValid = FALSE ❌
// Because: signature was created for ORIGINAL payload, not MODIFIED one

throw new Error('Invalid signature');
```

**Result in Middleware:**
```typescript
// fetchAuthSession() threw error, caught in catch block
catch (error) {
  authenticated = false; // ❌ ACCESS DENIED
}

// User redirected to /login
return NextResponse.redirect(new URL('/login', request.url));
```

---

## Visual Flow: Secure Request

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User logs in                                                 │
│    POST /api/auth/login                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. AWS Cognito verifies credentials                             │
│    ✅ Username/password correct                                 │
│    ✅ Email verified                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Cognito generates JWT                                        │
│    - Header: { alg: "RS256", typ: "JWT" }                       │
│    - Payload: { sub, email, custom:role, custom:storeId, exp }  │
│    - Signature: sign(header+payload, COGNITO_PRIVATE_KEY)       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Token sent to browser                                        │
│    Set-Cookie: idToken=xxx; HttpOnly; Secure; SameSite=Strict  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Browser stores token in HTTP-only cookie                     │
│    ⚠️ JavaScript CANNOT access this cookie                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. User navigates to /dashboard                                 │
│    Browser automatically includes cookie in request             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Middleware runs                                              │
│    const session = await fetchAuthSession(contextSpec)          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. fetchAuthSession() verifies token                            │
│    ✅ Signature valid (verified with Cognito public key)        │
│    ✅ Not expired (exp > now)                                   │
│    ✅ Issuer matches (iss = cognito-idp.us-east-1....)          │
│    ✅ Custom claims exist (custom:role, custom:storeId)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Middleware allows access                                     │
│    authenticated = true                                         │
│    return NextResponse.next() → User sees /dashboard            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary Table

| Security Layer | Attack Vector | Protection Mechanism |
|---------------|--------------|---------------------|
| 1. HTTP-Only Cookies | XSS - JavaScript token theft | `document.cookie` cannot access |
| 2. HTTPS | Network interception | TLS 1.3 encryption |
| 3. JWT Signature | Token tampering | RSA-256 cryptographic verification |
| 4. Token Expiration | Token replay | Tokens expire after 1 hour |
| 5. Issuer Verification | Cross-pool attacks | Only tokens from your Cognito pool |
| 6. Custom Claims | Invalid token structure | Application-specific validation |

---

## TL;DR - Is it secure?

**YES** - The code `authenticated = !!session.tokens?.idToken` is secure because:

1. **Tokens cannot be modified** without invalidating the signature
2. **Signature verification happens inside fetchAuthSession()** using Cognito's public key
3. **Only Cognito has the private key** to create valid signatures
4. **If verification fails**, `session.tokens` is `undefined`
5. **Therefore**, `authenticated = false` for any invalid/tampered token

The security is **NOT** in the `!!` check.
The security is in the **CRYPTOGRAPHIC VERIFICATION** that happens inside `fetchAuthSession()`.

We're just checking "did the verification succeed?" - if it failed, `idToken` would be `undefined`.

---

## Code Reference

See enhanced middleware with all security layers:
- `src/middleware.ts` - Lines 48-90

See detailed JWT security explanation:
- `docs/security-jwt-tokens.md`

See practical examples:
- `docs/middleware-examples.md`
