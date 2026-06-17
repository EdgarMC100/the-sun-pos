# Product Requirements Document: The Sun Pos

## 1. Product Overview

**Product Name:** The Sun Pos
**Product Type:** Point of Sale (POS) Web Application
**Target Market:** Small to medium retail businesses
**Deployment:** Cloud-based (AWS), accessible via web browser

### Vision Statement
Provide a simple, secure, and multi-tenant POS system where business owners can manage their stores and cashiers can process transactions efficiently without requiring personal email addresses.

---

## 2. Business Goals

### Primary Goals
1. **Simplify cashier onboarding** - No email required, instant credential generation
2. **Multi-tenant architecture** - Each business operates independently with isolated data
3. **Role-based access control** - Clear separation between owner/admin and cashier capabilities
4. **Secure authentication** - Username-based login with proper credential management
5. **Offline capability** - Transactions can be created offline and synced when online

### Success Metrics
- Admin can create a new cashier in < 2 minutes
- Cashier can login and process first transaction in < 1 minute
- Zero data leakage between different stores (multi-tenant isolation)
- 99.9% uptime for transaction processing

---

## 3. User Personas

### Persona 1: Admin/Owner
**Name:** Maria (Store Owner)
**Role:** Administrator
**Goals:**
- Manage store operations from anywhere
- Add/remove cashier accounts quickly
- Monitor all sales and transactions
- Maintain control over user access

**Pain Points:**
- Cashiers don't have email addresses
- Existing systems require complex onboarding
- Can't easily monitor real-time sales
- Needs simple user management

**Key Workflows:**
1. Register store account with email
2. Create cashier accounts (username + password only)
3. View all store transactions
4. Manage cashier permissions
5. Access store settings and reports

---

### Persona 2: Cashier
**Name:** Juan (Store Cashier)
**Role:** Point of Sale Operator
**Goals:**
- Login quickly with simple credentials
- Process customer transactions efficiently
- View transaction history
- Work even when internet is unstable

**Pain Points:**
- Doesn't have/want to share personal email
- Needs simple login process
- Internet connectivity issues
- Shouldn't see other stores' data

**Key Workflows:**
1. Login with username and password (no email)
2. Create new transaction
3. Select products and payment method
4. View own transaction history
5. Logout at end of shift

---

## 4. Core Features & Requirements

### 4.1 Authentication & Authorization

#### FR-AUTH-001: Admin Self-Registration
**Description:** Business owners can create an admin account with email verification.

**Requirements:**
- **Input fields:** Name, email, username, store name, store type, password
- **Email verification required** for account activation
- **Unique constraints:** Email must be unique across all admins
- **Auto-creation:** Store record created automatically upon registration
- **Role assignment:** User added to "Admin" Cognito group
- **Custom attributes:** `custom:role = "admin"`, `custom:storeId = [UUID]`

**Acceptance Criteria:**
- [ ] Registration form validates all fields
- [ ] Email sent with verification code
- [ ] Cannot login until email verified
- [ ] Store record exists in database after registration
- [ ] User redirected to `/dashboard/admin` after first login

---

#### FR-AUTH-002: Cashier Creation (Admin Only)
**Description:** Admins can create cashier accounts without requiring email addresses.

**Requirements:**
- **Who can create:** Only users with role "Admin"
- **Input fields:** Username, password
- **NO email required** from admin or cashier
- **Internal email generated:** `cashier_{username}@internal.thesunpos.local`
- **Email suppression:** Cashier never receives any emails
- **Credential delivery:** Admin receives credentials to give to cashier (print/write)
- **Store association:** Cashier linked to admin's `storeId` automatically
- **Role assignment:** User added to "Cashier" Cognito group
- **Custom attributes:** `custom:role = "cashier"`, `custom:storeId = [admin's storeId]`

**Acceptance Criteria:**
- [ ] Only admins can access cashier creation page
- [ ] Form validates username uniqueness
- [ ] Internal email format applied automatically
- [ ] `email_verified = true` set at creation (no verification needed)
- [ ] Success message displays generated credentials
- [ ] Cashier can login immediately with username + password
- [ ] Cashier has NO real email in Cognito
- [ ] Non-admin users get 403 error when accessing creation endpoint

---

#### FR-AUTH-003: Username-Based Login
**Description:** Both admins and cashiers login using username (not email).

**Requirements:**
- **Login field:** Username (not email input field)
- **Resolution layer:** Frontend converts username → email before Cognito signIn
- **Display name:** UI shows `preferred_username`, not internal email
- **Redirect logic:**
  - Admin → `/dashboard/admin`
  - Cashier → `/dashboard/cashier`
- **Token claims:** JWT includes `custom:role`, `custom:storeId`, `preferred_username`

**Acceptance Criteria:**
- [ ] Login form has "Username" field (not "Email")
- [ ] Admin enters username (e.g., "maria.owner") → logs in successfully
- [ ] Cashier enters username (e.g., "juan.cajero") → logs in successfully
- [ ] Internal email never displayed to user
- [ ] Role-based redirect works correctly
- [ ] Username resolution fails gracefully if user not found

---

#### FR-AUTH-004: Password Requirements
**Description:** Enforce secure password policies for all users.

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Special characters optional

**Acceptance Criteria:**
- [ ] Registration/creation form validates password before submission
- [ ] Cognito rejects weak passwords
- [ ] Clear error messages for password violations

---

### 4.2 Role-Based Access Control

#### FR-RBAC-001: Admin Capabilities
**Description:** Define what admins can do in the system.

**Admin Permissions:**
- ✅ Create/read/update/delete cashiers
- ✅ View all store transactions
- ✅ Update store settings
- ✅ Access admin dashboard
- ✅ Generate reports (future)
- ❌ Cannot access other stores' data

**Protected Routes:**
- `/dashboard/admin/*` - Admin only
- `/dashboard/admin/users/create-cashier` - Admin only

**Acceptance Criteria:**
- [ ] Admin can create cashiers
- [ ] Admin sees all store transactions
- [ ] Admin cannot see data from other stores
- [ ] Cashiers blocked from admin routes (403/redirect)

---

#### FR-RBAC-002: Cashier Capabilities
**Description:** Define what cashiers can do in the system.

**Cashier Permissions:**
- ✅ Create transactions
- ✅ View own transactions
- ✅ Access cashier POS interface
- ❌ Cannot create other users
- ❌ Cannot view other stores' data
- ❌ Cannot access admin dashboard
- ❌ Cannot modify store settings

**Protected Routes:**
- `/dashboard/cashier/*` - Cashier only

**Acceptance Criteria:**
- [ ] Cashier can create transactions
- [ ] Cashier sees only own transaction history
- [ ] Cashier blocked from admin routes
- [ ] Cashier cannot access user management

---

### 4.3 Multi-Tenant Data Isolation

#### FR-TENANT-001: Store Isolation
**Description:** Ensure complete data separation between different stores.

**Requirements:**
- **Store identifier:** Each store has unique `storeId` (UUID)
- **User association:** All users linked to exactly one `storeId`
- **Data filtering:** All queries automatically filter by user's `storeId`
- **Authorization rules:** AppSync schema enforces tenant isolation
- **Cross-tenant prevention:** Users cannot query/modify other stores' data

**Acceptance Criteria:**
- [ ] Admin 1 cannot see Admin 2's data
- [ ] Cashier 1 cannot see data from Store 2
- [ ] All database queries include `storeId` filter
- [ ] Attempting cross-tenant access returns empty results or 403
- [ ] `storeId` immutable after user creation

---

### 4.4 Data Models

#### FR-DATA-001: Store
**Fields:**
- `storeId` (Primary Key, UUID)
- `name` (String, required)
- `type` (String, e.g., "retail", "restaurant")
- `ownerEmail` (String, admin's email)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Has many `UserProfile`
- Has many `Transaction`

**Authorization:**
- Owner: CRUD (where `storeId` matches user's `custom:storeId`)
- Admin group: CRUD (own store only)

---

#### FR-DATA-002: UserProfile
**Fields:**
- `userId` (Primary Key, Cognito sub)
- `username` (String, unique, indexed)
- `email` (String, admin has real email, cashier has internal)
- `role` ("admin" | "cashier")
- `storeId` (Foreign Key, UUID)
- `isActive` (Boolean, default true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to `Store`

**Authorization:**
- Owner: Read/Update (own profile only)
- Admin group: CRUD (own store users only)
- Cashier group: Read (own profile only)

**Indexes:**
- `username` (for username → email resolution)
- `storeId` (for filtering by store)

---

#### FR-DATA-003: Transaction
**Fields:**
- `transactionId` (Primary Key, UUID)
- `storeId` (Foreign Key, UUID)
- `cashierId` (Foreign Key, userId)
- `amount` (Float, required)
- `items` (JSON, array of products)
- `paymentMethod` ("cash" | "card" | "other")
- `timestamp` (DateTime, auto-generated)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationships:**
- Belongs to `Store`
- Belongs to `UserProfile` (cashier)

**Authorization:**
- Admin: CRUD (own store transactions only)
- Cashier: Create, Read (own transactions only)

**Example `items` JSON:**
```json
[
  { "name": "Product A", "price": 10.50, "quantity": 2 },
  { "name": "Product B", "price": 5.00, "quantity": 1 }
]
```

---

### 4.5 Offline Functionality (Future)

#### FR-OFFLINE-001: Offline Transaction Creation
**Description:** Cashiers can create transactions even when internet is unavailable.

**Requirements:**
- Transactions queue locally when offline
- Auto-sync when connection restored
- Conflict resolution strategy defined
- User notified of sync status

**Acceptance Criteria:**
- [ ] Transaction created offline stored in browser
- [ ] Sync icon shows pending transactions
- [ ] Transactions sync automatically when online
- [ ] Admin sees all transactions including offline-created ones

**Status:** Phase 2 (Not in initial implementation)

---

## 5. User Workflows

### Workflow 1: Admin Registration & First Cashier
1. Admin visits `/register`
2. Fills form: name, email, username, store info, password
3. Submits → Receives verification email
4. Clicks verification link
5. Redirected to `/login`
6. Logs in with username + password
7. Redirected to `/dashboard/admin`
8. Clicks "Create Cashier"
9. Enters cashier username and password
10. System shows generated credentials
11. Admin prints/writes credentials for cashier
12. Cashier can now login immediately

---

### Workflow 2: Cashier Login & Transaction
1. Cashier visits `/login`
2. Enters username (e.g., "juan.cajero")
3. Enters password
4. Clicks "Login"
5. Redirected to `/dashboard/cashier` (POS interface)
6. Selects products from catalog
7. Enters payment method
8. Clicks "Complete Transaction"
9. Transaction saved to database
10. Receipt displayed/printed
11. Cashier logs out at end of shift

---

## 6. Security Requirements

### SEC-001: Authentication Security
- ✅ Passwords hashed by Cognito (bcrypt)
- ✅ HTTPS only (enforced by AWS Amplify)
- ✅ JWT tokens for API authentication
- ✅ Tokens expire after configurable period
- ✅ HTTP-only cookies for SSR
- ❌ No API keys in client code

### SEC-002: Authorization Security
- ✅ Multi-tenant isolation via `storeId` filtering
- ✅ Role checks in Lambda functions
- ✅ AppSync authorization rules on all models
- ✅ Server-side validation of all mutations
- ✅ Admin-only functions check `cognito:groups`

### SEC-003: Data Security
- ✅ Customer data encrypted at rest (DynamoDB encryption)
- ✅ Data encrypted in transit (TLS)
- ✅ No PII in logs
- ✅ Cashier internal emails never exposed publicly

---

## 7. Non-Functional Requirements

### NFR-001: Performance
- Login response time < 2 seconds
- Transaction creation < 1 second
- Dashboard load time < 3 seconds
- Support 100+ concurrent users per store

### NFR-002: Scalability
- Support 1000+ stores in multi-tenant architecture
- Handle 10,000+ transactions per day per store
- Auto-scaling via AWS Amplify

### NFR-003: Availability
- 99.9% uptime SLA
- Graceful degradation when offline
- Automatic failover via AWS

### NFR-004: Usability
- Mobile-responsive design (works on tablets)
- Simple, intuitive interface
- Minimal training required for cashiers
- Keyboard shortcuts for POS operations

---

## 8. Constraints & Assumptions

### Technical Constraints
- ❌ Amplify Gen 2 requires email for sign-in (workaround: internal emails)
- ✅ Username resolution layer adds slight latency (acceptable)
- ✅ Next.js 16 App Router (SSR required)
- ✅ AWS Free Tier for initial deployment

### Business Constraints
- Cashiers do NOT have email addresses
- Single store per admin (Phase 1)
- English language only (Phase 1)

### Assumptions
- Stable internet for most operations (offline mode Phase 2)
- Users have modern web browsers (Chrome, Safari, Firefox)
- Admin has email for account recovery
- Cashiers trained by admin on using credentials

---

## 9. Success Criteria

### Phase 1 (MVP) - Must Have
- [x] Admin self-registration with email
- [x] Admin email verification
- [x] Admin username-based login
- [x] Admin can create cashiers (username + password only)
- [x] Cashier username-based login (no email)
- [x] Role-based dashboard redirects
- [x] Multi-tenant data isolation
- [ ] Cashier can create transactions
- [ ] Admin can view all store transactions
- [ ] Deployment to AWS Amplify

### Phase 2 - Should Have
- [ ] Offline transaction creation
- [ ] Transaction editing/voiding
- [ ] Product catalog management
- [ ] Basic reporting (daily sales)
- [ ] User activity logs

### Phase 3 - Nice to Have
- [ ] Multi-store support per admin
- [ ] Advanced reporting & analytics
- [ ] Receipt printing integration
- [ ] Inventory management
- [ ] Customer loyalty program

---

## 10. Out of Scope (Phase 1)

- ❌ Payment processing integration (Stripe, Square)
- ❌ Inventory management
- ❌ Receipt printer hardware integration
- ❌ Barcode scanner support
- ❌ Multi-language support
- ❌ Mobile native apps (web-only for now)
- ❌ Email notifications/alerts
- ❌ Two-factor authentication (TOTP)
- ❌ Password reset for cashiers (admin must reset)

---

## 11. Open Questions & Decisions Needed

1. **Cashier password reset:** Should admin reset via dashboard or contact support?
   - **Decision:** Admin resets via dashboard (Phase 2 feature)

2. **Username format:** Any restrictions on cashier usernames?
   - **Decision:** Alphanumeric + dots/underscores, 3-20 chars, unique globally

3. **Transaction limits:** Max transaction amount or items per transaction?
   - **Decision:** No hard limits in Phase 1, add validation in Phase 2 if needed

4. **Data retention:** How long to keep transaction history?
   - **Decision:** Indefinite retention (admin can export/archive in Phase 2)

5. **Concurrent cashiers:** Can multiple cashiers be logged in simultaneously?
   - **Decision:** Yes, no session limits

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Username resolution adds latency | Medium | Cache username→email mappings in frontend |
| Internal email format leaked publicly | Low | Use non-routable domain, never expose in UI |
| Cashier loses credentials | Medium | Admin can reset password via dashboard |
| AWS costs exceed budget | High | Monitor usage, use free tier, set billing alerts |
| Data leakage between stores | Critical | Extensive testing of tenant isolation |

---

## 13. Glossary

- **Admin/Owner:** Business owner with full system access
- **Cashier:** Store employee who processes transactions
- **Internal Email:** Fake email format for cashiers (`cashier_username@internal.thesunpos.local`)
- **Username Resolution:** Converting username to email before Cognito authentication
- **StoreId:** Unique identifier (UUID) for multi-tenant isolation
- **Custom Claims:** Additional data in JWT token (role, storeId)
- **Multi-Tenant:** Architecture where multiple stores share infrastructure with isolated data

---

**Document Version:** 1.0
**Last Updated:** 2025-01-XX
**Owner:** Edgar Cortes
**Status:** Approved for Phase 1 Implementation

---

> This PRD follows LIDR's Spec-Driven Development methodology - requirements defined before implementation begins.
