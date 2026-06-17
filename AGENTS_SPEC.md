# AI Agents Specification - The Sun Pos

Comprehensive agent specifications for AI-assisted development on The Sun Pos project.

---

## 🎨 Frontend Agents

### 1. Component Builder Agent

**Purpose:** Creates React components following CSS Modules patterns and Next.js App Router conventions.

**Responsibilities:**
- Generate React components with proper TypeScript interfaces
- Decide between Server Component vs Client Component
- Co-locate `.module.css` files with components
- Ensure PascalCase naming conventions
- Implement proper props destructuring and typing
- Follow one component per file principle

**Skills:**
- TypeScript interface definition
- CSS Modules setup
- Next.js App Router patterns
- Accessibility best practices

**Output Example:**
```tsx
// Button.tsx
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  variant = 'primary',
  disabled = false,
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={`${styles[variant]} ${disabled ? styles.disabled : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

---

### 2. Styling & Responsive Agent

**Purpose:** Implements CSS Modules with simplified BEM approach and ensures responsive design.

**Responsibilities:**
- Create `.module.css` files with camelCase class names
- Implement mobile-first responsive design
- Use `dvh` instead of `vh` for viewport units
- Manage CSS variables and design tokens in `globals.css`
- Use `composes` for style variants
- Ensure logical property organization

**Skills:**
- CSS Modules methodology
- Modern CSS (Grid, Flexbox, Custom Properties)
- Responsive design patterns
- Accessibility in styling

**Guidelines:**
- ✅ camelCase: `.primaryButton`, `.cardHeader`
- ✅ Use `composes` for variants
- ✅ Mobile-first with media queries
- ✅ CSS variables: `var(--color-primary)`
- ❌ No BEM: `.card__header--large`
- ❌ No inline styles
- ❌ No global classes in modules

---

### 3. UI/UX Enhancement Agent

**Purpose:** Enhances user experience with animations, interactions, and optimized assets.

**Responsibilities:**
- Implement animations and transitions
- Optimize images with `next/image`
- Handle loading states and skeletons
- Implement error boundaries
- Ensure WCAG accessibility compliance
- Add focus management and keyboard navigation

**Skills:**
- Animation libraries (react-fast-marquee, CSS animations)
- Next.js Image optimization
- Accessibility (ARIA, semantic HTML)
- UX patterns (loading, error states)

---

## 🔧 Backend Agents

### 4. API Route Agent

**Purpose:** Creates Next.js App Router API routes with proper error handling and TypeScript.

**Responsibilities:**
- Create `route.ts` files in App Router structure
- Implement GET, POST, PUT, DELETE handlers
- Add request/response validation
- Handle errors gracefully
- Define TypeScript types for API contracts
- Implement proper HTTP status codes

**Skills:**
- Next.js App Router API routes
- TypeScript for request/response typing
- Error handling patterns
- RESTful API design

**Output Example:**
```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Logic here
    return NextResponse.json({ data: [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

---

### 5. Data Layer Agent

**Purpose:** Handles server-side data fetching, caching, and server actions.

**Responsibilities:**
- Implement data fetching in Server Components
- Set up caching strategies
- Create Server Actions for mutations
- Handle database queries (if applicable)
- Implement optimistic updates
- Manage data revalidation

**Skills:**
- Next.js data fetching patterns
- Server Actions
- Caching strategies
- Database integrations

---

### 6. Integration Agent

**Purpose:** Manages AWS Amplify configurations and third-party integrations.

**Responsibilities:**
- Configure AWS Amplify deployment
- Manage environment variables
- Set up third-party API integrations
- Optimize build configurations
- Handle CI/CD pipeline
- Configure security and authentication

**Skills:**
- AWS Amplify
- Environment configuration
- Build optimization
- Security best practices

---

## 🧪 Quality Assurance Agents

### 7. Testing Agent

**Purpose:** Creates and maintains test suites for components, utilities, and API routes.

**Responsibilities:**
- Write unit tests for utilities
- Create component tests
- Implement integration tests for API routes
- Suggest E2E test scenarios
- Ensure test coverage
- Mock external dependencies

**Skills:**
- Testing frameworks (Jest, React Testing Library)
- Test-driven development
- Mocking strategies
- Coverage analysis

---

### 8. Code Quality Agent

**Purpose:** Enforces TypeScript strict mode, ESLint rules, and performance best practices.

**Responsibilities:**
- Ensure TypeScript strict mode compliance
- Fix ESLint errors and warnings
- Suggest performance optimizations
- Enforce security best practices
- Review code for anti-patterns
- Suggest refactoring opportunities

**Skills:**
- TypeScript advanced typing
- ESLint configuration
- Performance optimization
- Security auditing

---

## 🔍 Code Reviewer Agent

### Purpose
Systematically review code changes against project standards, architectural decisions, and Next.js 16 best practices before commits or PRs.

### Review Checklist

#### **Architecture & Patterns**
- [ ] Uses App Router patterns (not Pages Router)
- [ ] Correct import: `next/navigation` (not `next/router`)
- [ ] Server Components by default, Client Components only when needed
- [ ] No `getServerSideProps` or `getStaticProps` usage
- [ ] File-based routing in `src/app/` directory
- [ ] One component per file principle

#### **TypeScript Standards**
- [ ] Strict mode compliance
- [ ] No implicit `any` types
- [ ] Explicit interfaces for component props
- [ ] Interfaces for objects, types for unions
- [ ] Proper file extensions (`.ts` for utils, `.tsx` for components)
- [ ] Type safety for event handlers

#### **Component Quality**
- [ ] PascalCase naming for components
- [ ] Props interface defined and exported
- [ ] `'use client'` directive only when necessary (hooks, events, browser APIs)
- [ ] Proper error boundaries and loading states
- [ ] Accessibility attributes (ARIA labels, semantic HTML)
- [ ] No console.log statements in production code

#### **Styling (CSS Modules)**
- [ ] `.module.css` co-located with component
- [ ] camelCase class names (no BEM `__` or `--`)
- [ ] Uses `composes` for variants
- [ ] No inline styles
- [ ] No global classes in module files
- [ ] CSS variables used for design tokens
- [ ] Responsive design implemented (mobile-first)
- [ ] Uses `dvh` instead of `vh` for viewport height
- [ ] Properties organized logically (position → box model → typography → visual)

#### **Next.js Specific**
- [ ] `next/image` used instead of `<img>` tags
- [ ] Images have proper `alt` attributes
- [ ] Metadata configured correctly
- [ ] Font loading optimized via `src/app/fonts.ts`
- [ ] No modifications to `amplify.yml` without justification
- [ ] Build succeeds (`pnpm build`)

#### **Code Quality**
- [ ] No ESLint errors or warnings
- [ ] Follows existing code patterns
- [ ] DRY principle (no unnecessary duplication)
- [ ] Clear, descriptive variable/function names
- [ ] Complex logic has JSDoc comments
- [ ] Error handling implemented
- [ ] Loading states for async operations

#### **Performance**
- [ ] Images optimized and properly sized
- [ ] No unnecessary re-renders
- [ ] Async operations properly handled
- [ ] Bundle size considerations
- [ ] Code splitting where appropriate

#### **Security**
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables used correctly
- [ ] Input validation for user data
- [ ] XSS prevention
- [ ] SQL injection prevention (if applicable)

#### **Testing & Verification**
- [ ] Tested on mobile, tablet, desktop viewports
- [ ] No browser console errors
- [ ] Works with JavaScript disabled (where applicable)
- [ ] Backwards compatible with existing features
- [ ] Matches specification/acceptance criteria

#### **Documentation**
- [ ] Complex logic documented
- [ ] New features added to relevant docs
- [ ] CLAUDE.md updated if architecture changed
- [ ] Environment variables documented

### Review Workflow

**Before Commit:**
```bash
# 1. Run linter
pnpm lint

# 2. Type check
tsc --noEmit

# 3. Test build
pnpm build

# 4. Agent review
# Review all changed files against checklist
```

**Output Format:**
```
✅ APPROVED | ❌ NEEDS CHANGES | ⚠️ SUGGESTIONS

[File Path]
  ✅ TypeScript: All types properly defined
  ❌ Styling: Using traditional BEM instead of simplified CSS Modules
  ⚠️ Performance: Consider lazy loading for large component

Action Items:
1. Update Button.module.css to use camelCase classes
2. Remove BEM modifiers (.button__icon--large → .iconLarge)
3. Consider React.lazy() for UserProfileCard
```

### Integration Points
- Pre-commit hooks
- PR review automation
- IDE integration for real-time feedback
- CI/CD pipeline checks

---

## 🚀 Implementation Plan

### Phase 1: Setup (Week 1)
1. Choose AI agent platform/framework
2. Configure agent access to codebase
3. Set up testing environment
4. Define agent prompt templates

### Phase 2: Core Agents (Week 2-3)
1. Implement Component Builder Agent
2. Implement Styling & Responsive Agent
3. Implement Code Reviewer Agent
4. Test and refine prompts

### Phase 3: Backend & Quality (Week 4)
1. Implement API Route Agent
2. Implement Code Quality Agent
3. Set up automated workflows
4. Integration testing

### Phase 4: Enhancement (Week 5+)
1. Implement remaining agents
2. Optimize agent performance
3. Create documentation
4. Train team on usage

---

## 📋 Agent Prompt Templates

### Component Builder Template
```
You are the Component Builder Agent for The Sun Pos project.

Context:
- Next.js 16 App Router
- TypeScript strict mode
- CSS Modules with simplified BEM
- React 19

Task: Create a [ComponentName] component

Requirements:
1. Server Component by default (add 'use client' only if needed)
2. TypeScript interface for props
3. Co-located .module.css file
4. Accessibility attributes
5. Responsive design

Follow CLAUDE.md and AGENTS.md standards.
```

### Code Reviewer Template
```
You are the Code Reviewer Agent for The Sun Pos project.

Review the following code against:
- Architecture & Patterns checklist
- TypeScript Standards
- CSS Modules conventions
- Next.js 16 best practices
- Security and Performance

Provide:
✅ Approved items
❌ Required changes
⚠️ Suggestions for improvement

Reference: CLAUDE.md, AGENTS.md
```

---

## 🛠 Tools & Platforms

### Recommended Agent Platforms
- **Custom GPT** - OpenAI GPT-4 with custom instructions
- **Claude Projects** - Anthropic Claude with project knowledge
- **GitHub Copilot** - IDE integration
- **Cursor** - AI-first code editor
- **Cody** - Sourcegraph AI assistant

### Integration Tools
- Pre-commit hooks (Husky)
- GitHub Actions for CI/CD
- ESLint for code quality
- TypeScript compiler for type checking

---

## 📚 References

- [CLAUDE.md](./CLAUDE.md) - Project context and standards
- [AGENTS.md](./AGENTS.md) - Next.js specific rules
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Last Updated:** 2026-06-05
**Maintained by:** Edgar Cortes

---

> Ready to implement tomorrow! Start with Code Reviewer Agent and Component Builder Agent for maximum impact.
