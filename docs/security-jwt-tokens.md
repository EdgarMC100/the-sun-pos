# JWT Token Security - Why `session.tokens?.idToken` is Safe

## The Security Concern

**Question:** "Can someone modify `session.tokens` to bypass authentication?"

**Short Answer:** No - JWT tokens are cryptographically signed and verified.

---

## How JWT (JSON Web Token) Security Works

### 1. Token Structure

A JWT has 3 parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Part 1 (Header):** Algorithm and token type
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**Part 2 (Payload):** User data (claims)
```json
{
  "sub": "1234567890",
  "email": "admin@example.com",
  "custom:role": "admin",
  "custom:storeId": "uuid-here",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Part 3 (Signature):** Cryptographic signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  SECRET_PRIVATE_KEY_FROM_COGNITO
)
```

---

## What Happens When fetchAuthSession() Runs

### Step-by-Step Security Verification

```typescript
// Middleware code
const session = await fetchAuthSession(contextSpec);
authenticated = !!session.tokens?.idToken;
```

**Behind the scenes:**

1. **Retrieve token from HTTP-only cookie**
   - Token stored in secure cookie (JavaScript cannot access)
   - Cookie has `httpOnly: true`, `secure: true`, `sameSite: strict`

2. **Parse the JWT**
   - Split into header, payload, signature

3. **Verify signature (THIS IS THE KEY SECURITY STEP)**
   ```typescript
   // Amplify internally does this:
   const publicKey = await getCognitoPublicKey(region, userPoolId);
   const isValid = crypto.verify(
     'RSA-SHA256',
     Buffer.from(header + '.' + payload),
     publicKey,
     Buffer.from(signature)
   );

   if (!isValid) {
     throw new Error('Invalid token signature');
   }
   ```

4. **Check expiration**
   ```typescript
   const now = Math.floor(Date.now() / 1000);
   if (payload.exp < now) {
     throw new Error('Token expired');
   }
   ```

5. **Verify issuer**
   ```typescript
   const expectedIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
   if (payload.iss !== expectedIssuer) {
     throw new Error('Invalid token issuer');
   }
   ```

6. **Only if ALL checks pass:**
   ```typescript
   return { tokens: { idToken: validatedToken } };
   ```

---

## Attack Scenarios (And Why They Fail)

### Attack 1: Modify Token Payload

**Attacker's Goal:** Change `"custom:role": "cashier"` to `"custom:role": "admin"`

```typescript
// Original token
const originalToken = "header.payload.signature";

// Attacker decodes payload
const payload = base64Decode("payload");
// { "custom:role": "cashier", ... }

// Attacker modifies it
payload["custom:role"] = "admin";

// Attacker creates new token
const maliciousToken = `header.${base64Encode(payload)}.signature`;
```

**Why it fails:**
```typescript
// When fetchAuthSession() verifies the token:
const signature = verify(header + '.' + modifiedPayload, cognitoPublicKey);
// ❌ Signature verification FAILS
// The signature was created for the ORIGINAL payload
// Changing payload invalidates the signature
```

**Result:** `fetchAuthSession()` throws an error, `authenticated = false`

---

### Attack 2: Create Fake Token with New Signature

**Attacker's Goal:** Create entirely new token and sign it

```typescript
const fakePayload = {
  "sub": "attacker-id",
  "custom:role": "admin",
  "custom:storeId": "any-store",
  "exp": Date.now() + 3600
};

// Attacker tries to sign with their own private key
const fakeSignature = sign(header + '.' + fakePayload, attackerPrivateKey);
const fakeToken = `header.${base64Encode(fakePayload)}.${fakeSignature}`;
```

**Why it fails:**
```typescript
// When fetchAuthSession() verifies:
const isValid = verify(
  header + '.' + fakePayload,
  fakeSignature,
  COGNITO_PUBLIC_KEY  // <-- Only Cognito's public key works!
);
// ❌ FAILS - signature was created with wrong private key
```

**Result:** `fetchAuthSession()` throws an error, `authenticated = false`

---

### Attack 3: Steal Token from Cookie

**Attacker's Goal:** Steal valid token from user's browser

```javascript
// Attacker tries to access cookie via JavaScript
document.cookie; // ❌ Returns empty for httpOnly cookies
localStorage.getItem('token'); // ❌ Not stored in localStorage
```

**Why it fails:**
- Cookies are `httpOnly: true` → JavaScript cannot access
- Cookies are `secure: true` → Only sent over HTTPS
- Cookies are `sameSite: strict` → Not sent on cross-site requests

**Only way to steal:** Man-in-the-middle attack on HTTP
**Prevention:** Force HTTPS (AWS Amplify does this automatically)

---

### Attack 4: Replay Valid Token from Different User

**Attacker's Goal:** Intercept Alice's token and use it to access Alice's data

```typescript
// Attacker intercepts Alice's valid token
const aliceToken = "valid.token.from.alice";

// Attacker sends request with Alice's token
fetch('/dashboard', {
  headers: {
    Cookie: `idToken=${aliceToken}`
  }
});
```

**Why it partially succeeds (but is limited):**
✅ Token is valid (signature verifies)
✅ Attacker gains access to Alice's account
❌ **BUT** attacker needs to intercept token first

**Mitigations:**
1. **Short token expiration** (Cognito default: 1 hour)
2. **HTTPS** prevents interception
3. **IP-based anomaly detection** (optional - Cognito Advanced Security)
4. **Device fingerprinting** (optional)

---

## What Makes This Secure

### 1. **Asymmetric Cryptography**
- Cognito signs tokens with **private key** (secret, never shared)
- Amplify verifies with **public key** (can be shared safely)
- Only Cognito can create valid signatures
- Anyone can verify, but no one else can create

### 2. **HTTP-Only Cookies**
- Token stored in cookie with `httpOnly: true`
- JavaScript cannot access: `document.cookie` returns nothing
- Prevents XSS (Cross-Site Scripting) attacks

### 3. **Short Expiration**
- Tokens expire quickly (default: 1 hour)
- Refresh tokens used to get new ID tokens
- Stolen token only valid for short time

### 4. **HTTPS Enforced**
- AWS Amplify forces HTTPS
- Prevents man-in-the-middle attacks
- Cookies only sent over encrypted connections

### 5. **Same-Site Cookies**
- `sameSite: strict` prevents CSRF attacks
- Cookies not sent on cross-site requests

---

## Real Code Example - What Happens

```typescript
// ❌ ATTACK ATTEMPT
// Attacker modifies cookie in browser DevTools
document.cookie = "idToken=fake.modified.token; path=/; secure; httpOnly";
// ERROR: Cannot set httpOnly cookie from JavaScript!

// ✅ WHAT ACTUALLY HAPPENS IN MIDDLEWARE
const session = await fetchAuthSession(contextSpec);
// Internally:
// 1. Read token from httpOnly cookie ✅
// 2. Parse JWT into header.payload.signature ✅
// 3. Fetch Cognito public key ✅
// 4. Verify signature: crypto.verify(data, signature, cognitoPublicKey)
//    ❌ FAILS if token modified
// 5. Check expiration ✅
// 6. Check issuer ✅
// If ANY check fails → session.tokens = undefined

authenticated = !!session.tokens?.idToken;
// If signature invalid → session.tokens is undefined
// So authenticated = false ✅ Secure!
```

---

## Summary: Why It's Secure

| Attack Vector | Protection Mechanism |
|--------------|---------------------|
| Modify token payload | Signature verification fails |
| Create fake token | Can't sign without Cognito's private key |
| Steal token from browser | HTTP-only cookies prevent JavaScript access |
| Intercept token over network | HTTPS encryption |
| Replay old token | Token expiration (1 hour) |
| Cross-site attacks | SameSite cookie policy |
| Brute force signature | RSA-256 cryptography (computationally infeasible) |

---

## Additional Security Best Practices

While the current implementation is secure, here are enhancements:

### 1. Token Expiration Monitoring
```typescript
// Check token age
const payload = idToken.payload;
const tokenAge = Date.now() / 1000 - payload.iat;
if (tokenAge > 3600) { // 1 hour
  // Force re-authentication
}
```

### 2. Verify Custom Claims
```typescript
// Ensure storeId exists
if (!payload['custom:storeId']) {
  throw new Error('Invalid token: missing storeId');
}

// Ensure role is valid
if (!['admin', 'cashier'].includes(payload['custom:role'])) {
  throw new Error('Invalid token: invalid role');
}
```

### 3. Rate Limiting
```typescript
// Prevent brute force attempts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});
```

### 4. IP Allowlisting (Optional)
```typescript
// For admin accounts, restrict to known IPs
const allowedIPs = ['192.168.1.1', '10.0.0.1'];
if (role === 'admin' && !allowedIPs.includes(requestIP)) {
  // Alert admin of suspicious login
}
```

---

## Conclusion

**The code `authenticated = !!session.tokens?.idToken` is secure because:**

1. `fetchAuthSession()` does **cryptographic signature verification**
2. Tokens are **signed by Cognito** using RSA-256
3. Only **Cognito's private key** can create valid signatures
4. Modifying the token **invalidates the signature**
5. Invalid tokens return `session.tokens = undefined`
6. Therefore, `authenticated = false` for any tampered token

**The security is NOT in checking if `idToken` exists.**
**The security is in the CRYPTOGRAPHIC VERIFICATION that happens inside `fetchAuthSession()`.**

The `!!session.tokens?.idToken` is just checking "did the verification succeed?"
If verification failed, `idToken` would be `undefined`, making `authenticated = false`.

---

## Further Reading

- [JWT.io Introduction](https://jwt.io/introduction)
- [AWS Cognito JWT Tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
