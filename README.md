# The Sun Pos

A modern web application built with Next.js 16, featuring AI-assisted development with a comprehensive agent suite.

## 🛠 Tech Stack

- **Framework:** Next.js 16.2.5 (App Router)
- **React:** 19.2.4
- **TypeScript:** 5.x (strict mode)
- **Styling:** CSS Modules (simplified BEM approach)
- **Package Manager:** pnpm
- **Deployment:** AWS Amplify
- **Node Version:** 20.x

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (install globally: `npm install -g pnpm`)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Production build
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## 🤖 AI-Assisted Development

This project uses a comprehensive AI agent suite to ensure consistent code quality and architectural patterns.

### Available Agents (9 total)

**Frontend Agents:**
- **Component Builder** - Creates React components with TypeScript and CSS Modules
- **Styling & Responsive** - Implements responsive design with mobile-first approach
- **UI/UX Enhancement** - Adds animations, optimizations, and accessibility

**Backend Agents:**
- **API Route** - Creates Next.js API routes with validation and error handling
- **Data Layer** - Manages server-side data fetching and Server Actions
- **Integration** - Handles AWS Amplify and third-party integrations

**Quality Assurance Agents:**
- **Testing** - Creates comprehensive test suites
- **Code Quality** - Enforces TypeScript, ESLint, and performance standards
- **Code Reviewer** - Reviews code against project standards before commits

### Using Agents

```bash
# Example: Create a new component
As Component Builder Agent, create a ProductCard component with
image, title, price, and proper TypeScript interfaces.

# Example: Review before commit
As Code Reviewer Agent, review my recent changes against
project standards.
```

📚 **Full Agent Documentation:** [.claude/agents/README.md](.claude/agents/README.md)

## 📁 Project Structure

```
the-sun-pos/
├── src/
│   └── app/              # Next.js App Router pages
│       ├── layout.tsx    # Root layout
│       ├── page.tsx      # Home page
│       └── fonts.ts      # Font configuration
├── public/               # Static assets
├── .claude/              # AI agent suite
│   ├── agents/          # Agent specifications
│   └── commands/        # Custom skills
├── CLAUDE.md            # Project context and standards
├── AGENTS.md            # Next.js 16 specific rules
└── amplify.yml          # AWS Amplify configuration
```

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project context, standards, and conventions
- **[AGENTS.md](./AGENTS.md)** - Next.js 16 specific guidelines
- **[AI Agents Guide](./.claude/agents/README.md)** - How to use AI agents for development

## 🎯 Development Workflow

### Standard Workflow with Agents

1. **Build** - Use Component Builder or API Route agents
2. **Style** - Apply Styling & Responsive agent
3. **Enhance** - Add UI/UX improvements
4. **Test** - Create tests with Testing agent
5. **Review** - Run Code Reviewer agent
6. **Commit** - Commit with confidence

### Quality Gates

All code must pass:
- ✅ `pnpm lint` - No ESLint errors
- ✅ `tsc --noEmit` - No TypeScript errors
- ✅ `pnpm build` - Build succeeds
- ✅ Code Reviewer approval

## 🎨 Code Standards

### TypeScript
- Strict mode enabled
- Explicit types for all functions and components
- Interfaces for objects, types for unions

### React Components
- Server Components by default
- Client Components only when needed (`'use client'`)
- PascalCase naming
- One component per file

### Styling (CSS Modules)
- Co-located `.module.css` files
- camelCase class names (not BEM)
- CSS variables for design tokens
- Mobile-first responsive design
- Use `dvh` instead of `vh` for viewport height

### File Naming
- Components: PascalCase (`Button.tsx`)
- CSS Modules: Match component (`Button.module.css`)
- Utilities: camelCase (`formatDate.ts`)

## 🚨 Critical Don'ts

❌ Do NOT use:
- Pages Router patterns (use App Router)
- `next/router` (use `next/navigation`)
- Traditional BEM with CSS Modules
- `vh` units (use `dvh`)
- Tailwind or utility CSS (use CSS Modules)
- `getServerSideProps` or `getStaticProps`

## 🚀 Deployment

Deployed automatically via **AWS Amplify** on push to `main` branch.

### Environment Variables

Configure in AWS Amplify Console:
- Production: `main` branch
- Preview: Pull request branches

See `.env.example` for required variables (create this file as needed).

## 📝 Contributing

1. Create a feature branch
2. Use AI agents for development
3. Run quality gates (`lint`, `build`, `type-check`)
4. Get Code Reviewer approval
5. Submit pull request

## 🔗 Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [AWS Amplify](https://docs.amplify.aws/)

---

**Built with ❤️ using AI-assisted development**
