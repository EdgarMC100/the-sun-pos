# Reusable Components - Frontend Refactoring Plan

**Date:** 2026-06-24
**Status:** Planning
**Priority:** High
**Estimated Impact:** ~285 lines of code reduction

---

## Overview

Analysis of the authentication pages (login, register, verify-email) revealed significant code duplication. This document outlines 8 reusable components that will improve code maintainability, consistency, and reduce technical debt.

---

## Component Breakdown

### 1. AuthLayout ⭐ HIGH PRIORITY

**Description:** Two-column layout wrapper for all authentication pages.

**Current Usage:**
- Login page (110-260)
- Register page (161-512)
- Verify-email page (pending)

**Current Code (Duplicated 3x):**
```tsx
<div className={styles.container}>
  <div className={styles.split}>
    {/* Left Side - Brand Section */}
    <div className={styles.leftSide}>
      <BrandTitle>Papeleria el</BrandTitle>
      <Image src="/elsollogo.png" alt="El Sol Logo" width={350} height={350} />
    </div>

    {/* Right Side - Form Section */}
    <div className={styles.rightSide}>
      <div className={styles.formWrapper}>
        {/* Form content */}
      </div>
    </div>
  </div>
</div>
```

**Proposed Component:**
```tsx
// src/components/auth/AuthLayout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  logoSrc?: string;
  logoAlt?: string;
}

export default function AuthLayout({
  children,
  brandTitle = "Panaderos al",
  brandSubtitle = "Sol",
  logoSrc = "/elsollogo.png",
  logoAlt = "El Sol Logo"
}: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.split}>
        <div className={styles.leftSide}>
          <BrandTitle>{brandTitle}</BrandTitle>
          <Image
            className={styles.logo}
            src={logoSrc}
            alt={logoAlt}
            width={350}
            height={350}
            priority
          />
        </div>
        <div className={styles.rightSide}>
          <div className={styles.formWrapper}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Usage Example:**
```tsx
// login/page.tsx
<AuthLayout>
  <form className={styles.form} onSubmit={handleSubmit}>
    {/* Form fields */}
  </form>
</AuthLayout>
```

**Benefits:**
- Eliminates ~60 lines of duplicated code
- Consistent layout across all auth pages
- Easy to modify brand section globally
- Simplifies page components

**Files to Refactor:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/verify-email/page.tsx`

---

### 2. FormInput ⭐ HIGH PRIORITY

**Description:** Reusable form input field with label, icon, and error message.

**Current Usage:**
- Login: username, password fields
- Register: fullName, username, email, storeName fields
- Total occurrences: 8+

**Current Code (Duplicated 8x):**
```tsx
<div className={styles.field}>
  <label htmlFor="username" className={styles.label}>
    Username
  </label>
  <div className={styles.inputWrapper}>
    <UserIcon className={styles.inputIcon} />
    <input
      id="username"
      type="text"
      className={styles.input}
      placeholder="your.username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      disabled={loading}
      autoComplete="username"
    />
  </div>
  {errors.username && (
    <span id="username-error" className={styles.error} role="alert">
      {errors.username}
    </span>
  )}
</div>
```

**Proposed Component:**
```tsx
// src/components/auth/FormInput.tsx
interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
}

export default function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  autoComplete,
  required = false
}: FormInputProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.inputIcon}>{icon}</div>}
        <input
          id={id}
          type={type}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Usage Example:**
```tsx
<FormInput
  id="username"
  label="Username"
  placeholder="your.username"
  value={username}
  onChange={setUsername}
  error={errors.username}
  icon={<UserIcon />}
  disabled={loading}
  autoComplete="username"
  required
/>
```

**Benefits:**
- Eliminates ~120 lines of duplicated code
- Consistent input styling and behavior
- Built-in accessibility (ARIA attributes)
- Error handling standardized
- Easy to extend with new features

**Files to Refactor:**
- `src/app/login/page.tsx` (2 fields)
- `src/app/register/page.tsx` (6 fields)

---

### 3. PasswordInput ⭐ MEDIUM PRIORITY

**Description:** Specialized input for passwords with show/hide toggle.

**Current Usage:**
- Login: 1x (password)
- Register: 2x (password, confirmPassword)

**Current Code (Duplicated 3x):**
```tsx
<div className={styles.field}>
  <label htmlFor="password" className={styles.label}>
    Password
  </label>
  <div className={styles.inputWrapper}>
    <LockIcon className={styles.inputIcon} />
    <input
      id="password"
      type={showPassword ? 'text' : 'password'}
      className={styles.input}
      placeholder="••••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      disabled={loading}
      autoComplete="current-password"
    />
    <button
      type="button"
      className={styles.passwordToggle}
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </div>
  {errors.password && (
    <span className={styles.error}>{errors.password}</span>
  )}
</div>
```

**Proposed Component:**
```tsx
// src/components/auth/PasswordInput.tsx
interface PasswordInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  showStrength?: boolean;
  onStrengthChange?: (strength: number) => void;
}

export default function PasswordInput({
  id,
  label,
  placeholder = "••••••••••",
  value,
  onChange,
  error,
  disabled = false,
  autoComplete = "current-password",
  required = false,
  showStrength = false,
  onStrengthChange
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (showStrength && onStrengthChange) {
      onStrengthChange(getPasswordStrength(newValue));
    }
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        <LockIcon className={styles.inputIcon} />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Usage Example:**
```tsx
<PasswordInput
  id="password"
  label="Password"
  value={password}
  onChange={setPassword}
  error={errors.password}
  disabled={loading}
  required
/>
```

**Benefits:**
- Eliminates ~40 lines of duplicated code
- Consistent password field behavior
- Built-in show/hide functionality
- Optional password strength indicator
- Better UX with toggle button

**Files to Refactor:**
- `src/app/login/page.tsx` (1 field)
- `src/app/register/page.tsx` (2 fields)

---

### 4. FormHeader ⭐ MEDIUM PRIORITY

**Description:** Consistent form title and subtitle section.

**Current Usage:**
- Login: "Welcome back" + subtitle
- Register: "Create your account" + subtitle
- Verify-email: "Verify your email" + subtitle (centered)

**Current Code (Duplicated 3x):**
```tsx
<div className={styles.header}>
  <h2 className={styles.title}>Welcome back</h2>
  <p className={styles.subtitle}>Please enter your details to sign in.</p>
</div>
```

**Proposed Component:**
```tsx
// src/components/auth/FormHeader.tsx
interface FormHeaderProps {
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
  icon?: React.ReactNode;
}

export default function FormHeader({
  title,
  subtitle,
  align = 'left',
  icon
}: FormHeaderProps) {
  return (
    <div className={`${styles.header} ${styles[align]}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
```

**Usage Example:**
```tsx
// Login
<FormHeader
  title="Welcome back"
  subtitle="Please enter your details to sign in."
/>

// Verify Email
<FormHeader
  title="Verify your email"
  subtitle="We sent a 6-digit verification code to your email."
  align="center"
  icon={<MailCheckIcon />}
/>
```

**Benefits:**
- Eliminates ~20 lines of duplicated code
- Consistent header styling
- Flexible alignment options
- Optional icon support

**Files to Refactor:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/verify-email/page.tsx`

---

### 5. PrimaryButton 🔹 OPTIONAL

**Description:** Standardized primary action button with loading state.

**Current Usage:**
- Login: "Sign in" button
- Register: "Create account" button
- Verify-email: "Verify email" button

**Current Code (Duplicated 3x):**
```tsx
<button type="submit" className={styles.button} disabled={loading}>
  {loading ? 'Signing in...' : 'Sign in'}
</button>
```

**Proposed Component:**
```tsx
// src/components/auth/PrimaryButton.tsx
interface PrimaryButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function PrimaryButton({
  type = 'button',
  children,
  onClick,
  loading = false,
  loadingText,
  disabled = false,
  fullWidth = true,
  icon
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${fullWidth ? styles.fullWidth : ''}`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <span className={styles.spinner} />
          {loadingText || children}
        </>
      ) : (
        <>
          {children}
          {icon && <span className={styles.icon}>{icon}</span>}
        </>
      )}
    </button>
  );
}
```

**Usage Example:**
```tsx
<PrimaryButton
  type="submit"
  loading={loading}
  loadingText="Signing in..."
>
  Sign in
</PrimaryButton>
```

**Benefits:**
- Eliminates ~15 lines of duplicated code
- Consistent button styling
- Built-in loading state
- Optional icon support
- Better UX with spinner

**Files to Refactor:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/verify-email/page.tsx`

---

### 6. Checkbox 🔹 OPTIONAL

**Description:** Custom checkbox with label for forms.

**Current Usage:**
- Login: "Remember me" checkbox
- Register: "Terms & Privacy" checkbox

**Current Code (Duplicated 2x):**
```tsx
<div className={styles.checkboxRow}>
  <div
    className={styles.checkboxWrapper}
    onClick={() => setRememberMe(!rememberMe)}
    role="checkbox"
    aria-checked={rememberMe}
    tabIndex={0}
  >
    {rememberMe && <CheckIcon className={styles.checkboxIcon} />}
  </div>
  <label className={styles.checkboxLabel} onClick={() => setRememberMe(!rememberMe)}>
    Remember me for 30 days
  </label>
</div>
```

**Proposed Component:**
```tsx
// src/components/auth/Checkbox.tsx
interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string | React.ReactNode;
  disabled?: boolean;
  error?: string;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  error
}: CheckboxProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={styles.checkboxContainer}>
      <div className={styles.checkboxRow}>
        <div
          id={id}
          className={`${styles.checkboxWrapper} ${disabled ? styles.disabled : ''}`}
          onClick={handleToggle}
          role="checkbox"
          aria-checked={checked}
          aria-invalid={!!error}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          {checked && <CheckIcon className={styles.checkboxIcon} />}
        </div>
        <label className={styles.checkboxLabel} onClick={handleToggle}>
          {label}
        </label>
      </div>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Usage Example:**
```tsx
<Checkbox
  id="rememberMe"
  checked={rememberMe}
  onChange={setRememberMe}
  label="Remember me for 30 days"
/>

<Checkbox
  id="terms"
  checked={agreeToTerms}
  onChange={setAgreeToTerms}
  label="I agree to the Terms of Service and Privacy Policy."
  error={errors.terms}
/>
```

**Benefits:**
- Eliminates ~25 lines of duplicated code
- Consistent checkbox behavior
- Full keyboard accessibility
- Error message support
- Reusable across forms

**Files to Refactor:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

---

### 7. Alert 🔹 OPTIONAL

**Description:** Success/error/info alert messages.

**Current Usage:**
- Login: Error alert
- Register: Success message, error alerts
- Verify-email: Success/error messages

**Current Code (Varies):**
```tsx
{/* Login - Error */}
{errors.general && (
  <div className={styles.generalError} role="alert">
    {errors.general}
  </div>
)}

{/* Register - Success */}
{registrationSuccess && (
  <div className={styles.successMessage}>
    <h3>Registration Successful!</h3>
    <p>Please check your email to verify your account.</p>
    <Link href="/login" className={styles.successLink}>
      Go to Login
    </Link>
  </div>
)}

{/* Verify Email - Success */}
{success && (
  <div className={styles.successMessage}>
    <svg>...</svg>
    Email verified! Redirecting to login...
  </div>
)}
```

**Proposed Component:**
```tsx
// src/components/auth/Alert.tsx
interface AlertProps {
  variant: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function Alert({
  variant,
  children,
  title,
  onClose,
  action
}: AlertProps) {
  const icons = {
    success: <CheckCircleIcon />,
    error: <AlertCircleIcon />,
    info: <InfoIcon />,
    warning: <AlertTriangleIcon />
  };

  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="alert">
      <div className={styles.alertIcon}>{icons[variant]}</div>
      <div className={styles.alertContent}>
        {title && <h3 className={styles.alertTitle}>{title}</h3>}
        <p className={styles.alertMessage}>{children}</p>
        {action && (
          action.href ? (
            <Link href={action.href} className={styles.alertAction}>
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className={styles.alertAction}>
              {action.label}
            </button>
          )
        )}
      </div>
      {onClose && (
        <button onClick={onClose} className={styles.alertClose}>
          <XIcon />
        </button>
      )}
    </div>
  );
}
```

**Usage Example:**
```tsx
{/* Login Error */}
<Alert variant="error">
  {errors.general}
</Alert>

{/* Register Success */}
<Alert
  variant="success"
  title="Registration Successful!"
  action={{ label: "Go to Login", href: "/login" }}
>
  Please check your email to verify your account.
</Alert>

{/* Verify Email Success */}
<Alert variant="success">
  Email verified! Redirecting to login...
</Alert>
```

**Benefits:**
- Eliminates ~30 lines of duplicated code
- Consistent alert styling
- Support for multiple variants
- Optional title, action, and close button
- Built-in icons

**Files to Refactor:**
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/verify-email/page.tsx`

---

### 8. CodeInput 🔹 SPECIFIC USE CASE

**Description:** 6-digit verification code input component.

**Current Usage:**
- Verify-email: 6-digit code entry

**Current Code:**
```tsx
<div className={styles.codeInputs}>
  {code.map((digit, index) => (
    <input
      key={index}
      ref={el => inputRefs.current[index] = el}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) => handleCodeChange(index, e.target.value)}
      onKeyDown={(e) => handleKeyDown(index, e)}
      onPaste={index === 0 ? handlePaste : undefined}
      className={`${styles.codeInput} ${digit ? styles.filled : ''}`}
      disabled={loading || success}
      autoFocus={index === 0}
    />
  ))}
</div>
```

**Proposed Component:**
```tsx
// src/components/auth/CodeInput.tsx
interface CodeInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  error?: string;
}

export default function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  label,
  error
}: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (digit && !/^\d$/.test(digit)) return;

    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);

    // Auto-focus next
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-complete
    if (newValue.every(d => d !== '') && onComplete) {
      onComplete(newValue.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    if (new RegExp(`^\\d{${length}}$`).test(pastedData)) {
      const newValue = pastedData.split('');
      onChange(newValue);
      inputRefs.current[length - 1]?.focus();

      if (onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className={styles.codeField}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.codeInputs}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`${styles.codeInput} ${value[index] ? styles.filled : ''}`}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Usage Example:**
```tsx
<CodeInput
  length={6}
  value={code}
  onChange={setCode}
  onComplete={(fullCode) => handleVerify(fullCode)}
  disabled={loading || success}
  label="Verification code"
  error={error}
/>
```

**Benefits:**
- Encapsulates complex code input logic
- Reusable for any verification flow
- Built-in paste support
- Auto-focus and keyboard navigation
- Configurable length

**Files to Use:**
- `src/app/verify-email/page.tsx`
- Future: 2FA flows, phone verification

---

## Implementation Plan

### Phase 1: Critical Components ⭐ (Week 1)
1. **AuthLayout** - Foundation for all auth pages
2. **FormInput** - Most used component
3. **PasswordInput** - Extends FormInput

**Deliverables:**
- 3 new components
- Refactor login and register pages
- Reduce ~220 lines of code

---

### Phase 2: Polish Components 🔹 (Week 2)
4. **FormHeader** - Consistent headers
5. **Alert** - Standardized messaging
6. **Checkbox** - Form controls
7. **PrimaryButton** - Action buttons
8. **CodeInput** - Verification flows

**Deliverables:**
- 5 new components
- Refactor verify-email page
- Reduce additional ~65 lines of code
- Complete documentation

---

## Testing Strategy

### Unit Tests
- Each component should have tests covering:
  - Rendering with different props
  - User interactions (click, type, keyboard nav)
  - Accessibility (ARIA attributes, keyboard support)
  - Error states
  - Loading states

### Integration Tests
- Test forms using new components:
  - Login flow with FormInput + PasswordInput
  - Register flow with all inputs
  - Verification flow with CodeInput

### Accessibility Tests
- Run axe-core or similar tool
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

---

## CSS Architecture

### Shared Styles Location
```
src/components/auth/
├── AuthLayout.tsx
├── AuthLayout.module.css
├── FormInput.tsx
├── FormInput.module.css
├── shared.module.css  ← Shared variables and mixins
└── ...
```

### Shared CSS Variables
```css
/* shared.module.css */
:root {
  /* Colors */
  --auth-primary: #F09622;
  --auth-danger: #EF4444;
  --auth-success: #22C55E;
  --auth-text-primary: #212C4D;
  --auth-text-secondary: #5C6585;
  --auth-border: #E5E8F0;
  --auth-bg-surface: #FFFFFF;
  --auth-bg-app: #F5F6FA;

  /* Spacing */
  --auth-spacing-xs: 4px;
  --auth-spacing-sm: 8px;
  --auth-spacing-md: 16px;
  --auth-spacing-lg: 24px;
  --auth-spacing-xl: 32px;

  /* Border Radius */
  --auth-radius-sm: 6px;
  --auth-radius-md: 8px;
  --auth-radius-lg: 10px;
  --auth-radius-full: 999px;

  /* Typography */
  --auth-font-family: 'Inter', sans-serif;
  --auth-font-size-sm: 13px;
  --auth-font-size-base: 15px;
  --auth-font-size-lg: 18px;
  --auth-font-size-xl: 24px;
  --auth-font-size-2xl: 28px;
}
```

---

## File Structure

```
src/
├── components/
│   └── auth/
│       ├── AuthLayout.tsx
│       ├── AuthLayout.module.css
│       ├── FormInput.tsx
│       ├── FormInput.module.css
│       ├── PasswordInput.tsx
│       ├── PasswordInput.module.css
│       ├── FormHeader.tsx
│       ├── FormHeader.module.css
│       ├── PrimaryButton.tsx
│       ├── PrimaryButton.module.css
│       ├── Checkbox.tsx
│       ├── Checkbox.module.css
│       ├── Alert.tsx
│       ├── Alert.module.css
│       ├── CodeInput.tsx
│       ├── CodeInput.module.css
│       ├── shared.module.css
│       └── index.ts (barrel export)
├── app/
│   ├── login/
│   │   ├── page.tsx (refactored)
│   │   └── login.module.css (simplified)
│   ├── register/
│   │   ├── page.tsx (refactored)
│   │   └── register.module.css (simplified)
│   └── verify-email/
│       ├── page.tsx (new)
│       └── VerifyEmail.module.css (new)
└── docs/
    └── Frontend/
        └── REUSABLE_COMPONENTS_PLAN.md (this file)
```

---

## Success Metrics

- **Code Reduction:** ~285 lines eliminated
- **Maintainability:** DRY principle applied
- **Consistency:** All auth pages use same components
- **Accessibility:** WCAG 2.1 AA compliance
- **Type Safety:** Full TypeScript coverage
- **Test Coverage:** >80% for all components

---

## Migration Checklist

### AuthLayout
- [ ] Create component and CSS module
- [ ] Refactor login page
- [ ] Refactor register page
- [ ] Refactor verify-email page
- [ ] Remove duplicated CSS
- [ ] Test responsive layout

### FormInput
- [ ] Create component and CSS module
- [ ] Refactor login username field
- [ ] Refactor register fields (fullName, username, email, storeName)
- [ ] Update validation logic
- [ ] Test error states
- [ ] Test accessibility

### PasswordInput
- [ ] Create component and CSS module
- [ ] Refactor login password field
- [ ] Refactor register password fields
- [ ] Test show/hide toggle
- [ ] Test strength indicator (optional)
- [ ] Test accessibility

### FormHeader
- [ ] Create component and CSS module
- [ ] Refactor all page headers
- [ ] Test alignment options
- [ ] Test with/without icon

### Alert
- [ ] Create component and CSS module
- [ ] Refactor error messages
- [ ] Refactor success messages
- [ ] Test all variants
- [ ] Test with actions

### Checkbox
- [ ] Create component and CSS module
- [ ] Refactor login remember me
- [ ] Refactor register terms
- [ ] Test keyboard navigation
- [ ] Test accessibility

### PrimaryButton
- [ ] Create component and CSS module
- [ ] Refactor all submit buttons
- [ ] Test loading states
- [ ] Test disabled states

### CodeInput
- [ ] Create component and CSS module
- [ ] Use in verify-email page
- [ ] Test paste functionality
- [ ] Test keyboard navigation
- [ ] Test accessibility

---

## Future Considerations

### Additional Components
- **SecondaryButton** - For cancel/back actions
- **LinkButton** - For text-style links
- **FormSelect** - Dropdown select fields
- **FormTextarea** - Multi-line input
- **RadioGroup** - Radio button group
- **DatePicker** - Date input field

### Theming Support
- Add theme context for light/dark mode
- CSS variable-based theming
- Component variants per theme

### Form Library Integration
- Consider react-hook-form for complex forms
- Integrate with zod for validation schemas
- Type-safe form handling

---

## References

- **Current Files:**
  - `src/app/login/page.tsx`
  - `src/app/register/page.tsx`
  - `src/app/verify-email/page.tsx` (to be created)

- **Design System:**
  - Pencil design: `/Users/edgarcortes/Dev/PencilAI/sun-pos.pen`
  - Design node ID: `ZsoXI` (Verify Email screen)

- **Documentation:**
  - `CLAUDE.md` - CSS Module naming conventions
  - `PRD.md` - Product requirements
  - `AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md` - Auth implementation

---

**Last Updated:** 2026-06-24
**Author:** Claude (with Edgar Cortes)
**Status:** Ready for Implementation
