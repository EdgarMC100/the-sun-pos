# The Sun Pos - AI Agents

Comprehensive AI agent specifications for assisted development on The Sun Pos project.

---

## 📚 Quick Navigation

| Category | Agents | File |
|----------|--------|------|
| **Frontend** | Component Builder, Styling & Responsive, UI/UX Enhancement | [frontend-agents.md](./frontend-agents.md) |
| **Backend** | API Route, Data Layer, Integration, Amplify Gen 2 | [backend-agents.md](./backend-agents.md) |
| **Infrastructure** | Amplify Gen 2 Backend | [amplify-gen2-agent.md](./amplify-gen2-agent.md) |
| **Quality Assurance** | Testing, Code Quality | [qa-agents.md](./qa-agents.md) |
| **Code Review** | Code Reviewer | [code-reviewer-agent.md](./code-reviewer-agent.md) |

---

## 🎯 Agent Overview

### Frontend Agents

#### 1. Component Builder Agent
**ID:** `component-builder`

Creates React components with TypeScript, CSS Modules, and Next.js App Router patterns.

**Use when:**
- Creating new components
- Building UI elements
- Setting up component structure

**Key responsibilities:**
- Server vs Client Component decision
- TypeScript interfaces
- CSS Modules co-location
- Accessibility attributes

---

#### 2. Styling & Responsive Agent
**ID:** `styling-responsive`

Implements CSS Modules with modern CSS and mobile-first responsive design.

**Use when:**
- Styling components
- Creating responsive layouts
- Implementing design systems

**Key responsibilities:**
- camelCase CSS naming
- Mobile-first approach
- CSS variables management
- Responsive breakpoints

---

#### 3. UI/UX Enhancement Agent
**ID:** `uiux-enhancement`

Enhances UX with animations, optimized images, and accessibility.

**Use when:**
- Adding animations
- Optimizing images
- Implementing loading states
- Improving accessibility

**Key responsibilities:**
- next/image optimization
- Loading skeletons
- Error boundaries
- WCAG compliance

---

### Backend Agents

#### 4. API Route Agent
**ID:** `api-route`

Creates Next.js API routes with proper error handling and validation.

**Use when:**
- Creating REST endpoints
- Building APIs
- Handling server requests

**Key responsibilities:**
- route.ts files in app/api/
- Request/response validation
- HTTP status codes
- Error handling

---

#### 5. Data Layer Agent
**ID:** `data-layer`

Manages server-side data fetching, caching, and Server Actions.

**Use when:**
- Fetching data in Server Components
- Creating Server Actions
- Setting up caching strategies

**Key responsibilities:**
- Server Component data fetching
- Caching strategies
- Server Actions for mutations
- Data revalidation

---

#### 6. Integration Agent
**ID:** `integration`

Handles AWS Amplify, environment variables, and third-party integrations.

**Use when:**
- Configuring deployments
- Managing environment variables
- Integrating external APIs

**Key responsibilities:**
- amplify.yml configuration
- Environment variables
- Third-party API setup
- Build optimization

---

### Quality Assurance Agents

#### 7. Testing Agent
**ID:** `testing`

Creates comprehensive test suites for components, utilities, and API routes.

**Use when:**
- Writing tests
- Setting up test infrastructure
- Ensuring code coverage

**Key responsibilities:**
- Unit tests for utilities
- Component tests
- API route tests
- E2E test scenarios

---

#### 8. Code Quality Agent
**ID:** `code-quality`

Enforces TypeScript, ESLint, performance, and security standards.

**Use when:**
- Reviewing code quality
- Optimizing performance
- Ensuring security
- Refactoring code

**Key responsibilities:**
- TypeScript strict mode
- ESLint compliance
- Performance optimization
- Security best practices

---

### Code Review Agent

#### 9. Code Reviewer Agent
**ID:** `code-reviewer`

Systematically reviews code against project standards before commits/PRs.

**Use when:**
- Before committing code
- Creating pull requests
- Reviewing changes
- Ensuring standards compliance

**Key responsibilities:**
- Comprehensive code review
- Standards verification
- Quality gates enforcement
- Review report generation

---

## 🚀 How to Use

### Method 1: Direct Agent Invocation

```
As [Agent Name], [task description]
```

**Examples:**

```
As Component Builder Agent, create a Card component that displays
a product with image, title, price, and add-to-cart button.
```

```
As Styling & Responsive Agent, create CSS Module for a responsive
grid layout that shows 1 column on mobile, 2 on tablet, 4 on desktop.
```

```
As Code Reviewer Agent, review the recent changes to the ProductList
component against project standards.
```

### Method 2: Agent ID Reference

```
Use agent [agent-id] to [task description]
```

**Examples:**

```
Use agent component-builder to create a SearchBar component
with autocomplete functionality.
```

```
Use agent testing to write unit tests for the formatDate utility.
```

### Method 3: Multi-Agent Workflow

Combine multiple agents for complex tasks:

```
1. Use Component Builder Agent to create the UserProfile component
2. Use Styling & Responsive Agent to style it with mobile-first design
3. Use UI/UX Enhancement Agent to add loading states and animations
4. Use Testing Agent to create component tests
5. Use Code Reviewer Agent to verify everything meets standards
```

---

## 📋 Common Workflows

### Creating a New Feature

```
1. Component Builder Agent → Create component structure
2. Styling & Responsive Agent → Add CSS styling
3. UI/UX Enhancement Agent → Add interactions and optimizations
4. Testing Agent → Write tests
5. Code Reviewer Agent → Review before commit
```

### Building an API Endpoint

```
1. API Route Agent → Create route.ts with handlers
2. Data Layer Agent → Set up data fetching/caching
3. Testing Agent → Write API route tests
4. Code Reviewer Agent → Review before commit
```

### Deploying a Feature

```
1. Integration Agent → Update environment variables
2. Integration Agent → Optimize build configuration
3. Code Reviewer Agent → Final review
4. Commit and deploy
```

### Improving Code Quality

```
1. Code Quality Agent → Identify issues and improvements
2. Testing Agent → Add missing tests
3. Code Reviewer Agent → Verify improvements
```

---

## 🎨 Agent Usage Patterns

### Quick Tasks (Single Agent)

For simple, focused tasks, use one agent:

- **Add a button:** Component Builder Agent
- **Style a component:** Styling & Responsive Agent
- **Fix ESLint errors:** Code Quality Agent
- **Write tests:** Testing Agent

### Medium Tasks (2-3 Agents)

For moderate complexity, chain agents:

- **New component with styling:**
  1. Component Builder Agent
  2. Styling & Responsive Agent

- **API with tests:**
  1. API Route Agent
  2. Testing Agent

### Complex Tasks (4+ Agents)

For full features, use complete workflow:

- **Complete user registration:**
  1. Component Builder (form components)
  2. Styling & Responsive (responsive design)
  3. API Route (registration endpoint)
  4. Data Layer (user creation)
  5. UI/UX Enhancement (loading/error states)
  6. Testing (comprehensive tests)
  7. Code Reviewer (final review)

---

## ✅ Quality Gates

Each agent has specific quality gates. Before considering work complete:

### All Agents Must Pass:
- ✅ `pnpm lint` - No ESLint errors
- ✅ `tsc --noEmit` - No TypeScript errors
- ✅ `pnpm build` - Build succeeds

### Additional Gates by Agent:

**Component Builder:**
- Server/Client component decision documented
- Props interface exported
- Accessibility attributes present

**Styling & Responsive:**
- camelCase naming used
- Mobile-first approach
- CSS variables for tokens

**UI/UX Enhancement:**
- Images use next/image
- Loading states implemented
- WCAG AA compliance

**API Route:**
- Proper HTTP status codes
- Input validation
- Error handling

**Testing:**
- Minimum coverage thresholds met
- All tests passing
- Edge cases covered

**Code Quality:**
- No code smells
- Performance optimized
- Security best practices

**Code Reviewer:**
- All checklist items verified
- Review report generated
- Action items addressed

---

## 🔧 Configuration

### Prerequisites

All agents assume:
- Next.js 16 with App Router
- TypeScript strict mode
- CSS Modules (no Tailwind)
- React 19
- pnpm package manager
- AWS Amplify deployment

### Project Context

Agents reference:
- **CLAUDE.md** - Project standards and context
- **AGENTS.md** - Next.js 16 specific rules
- **AGENTS_SPEC.md** - Original specifications
- **This README** - Agent usage guide

---

## 📖 Reference Documents

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](../../CLAUDE.md) | Project overview and standards |
| [AGENTS.md](../../AGENTS.md) | Next.js version warnings |
| [AGENTS_SPEC.md](../../AGENTS_SPEC.md) | Detailed agent specifications |
| [frontend-agents.md](./frontend-agents.md) | Frontend agent details |
| [backend-agents.md](./backend-agents.md) | Backend agent details |
| [qa-agents.md](./qa-agents.md) | QA agent details |
| [code-reviewer-agent.md](./code-reviewer-agent.md) | Code review process |

---

## 🎓 Best Practices

### 1. Start with the Right Agent

Choose the agent that best matches your task:
- **Building?** → Component Builder
- **Styling?** → Styling & Responsive
- **API?** → API Route
- **Testing?** → Testing
- **Reviewing?** → Code Reviewer

### 2. Provide Context

Give agents enough information:
```
Good: "As Component Builder Agent, create a ProductCard component
       that displays product image, title, price, and rating with
       TypeScript interface and responsive design."

Poor: "Create a card component."
```

### 3. Chain Agents Logically

Follow natural workflow:
1. Build structure (Component Builder)
2. Add styling (Styling & Responsive)
3. Enhance UX (UI/UX Enhancement)
4. Test (Testing)
5. Review (Code Reviewer)

### 4. Use Code Reviewer Last

Always run Code Reviewer Agent before:
- Committing code
- Creating pull requests
- Deploying to production

### 5. Iterate When Needed

If an agent's output needs refinement:
```
"As [Agent Name], update the previous implementation to [changes]"
```

---

## 🚨 Common Pitfalls

### ❌ Don't

- Mix agent responsibilities (keep focused)
- Skip Code Reviewer Agent
- Ignore agent recommendations
- Use Pages Router patterns
- Hardcode values instead of using CSS variables
- Use BEM naming with CSS Modules
- Skip TypeScript interfaces
- Forget accessibility

### ✅ Do

- Use one agent per focused task
- Always review code before commit
- Follow agent recommendations
- Use App Router exclusively
- Use CSS variables for design tokens
- Use camelCase for CSS Modules
- Define explicit TypeScript types
- Prioritize accessibility

---

## 📊 Agent Selection Guide

```
Task: Need to build...

├─ A new component?
│  └─ Component Builder Agent
│
├─ Styles for a component?
│  └─ Styling & Responsive Agent
│
├─ Animations or image optimization?
│  └─ UI/UX Enhancement Agent
│
├─ An API endpoint?
│  └─ API Route Agent
│
├─ Data fetching logic?
│  └─ Data Layer Agent
│
├─ Deployment configuration?
│  └─ Integration Agent
│
├─ Tests?
│  └─ Testing Agent
│
├─ Performance or refactoring?
│  └─ Code Quality Agent
│
└─ Review existing code?
   └─ Code Reviewer Agent
```

---

## 🔄 Updates & Maintenance

**Last Updated:** 2026-06-06
**Maintained by:** Edgar Cortes

### Changelog

- **2026-06-06:** Initial agent suite created
  - Frontend agents (3)
  - Backend agents (3)
  - QA agents (2)
  - Code Reviewer agent (1)

### Future Enhancements

- [ ] Add deployment automation agent
- [ ] Create database migration agent
- [ ] Implement documentation generator agent
- [ ] Add performance monitoring agent

---

## 💡 Tips for Success

1. **Read the agent docs** - Each agent has specific examples and patterns
2. **Use the quality gates** - They ensure consistent output
3. **Reference project docs** - CLAUDE.md, AGENTS.md are your friends
4. **Iterate when needed** - Agents can refine their own work
5. **Combine agents** - Complex tasks benefit from multiple agents
6. **Review everything** - Code Reviewer Agent is your safety net

---

## 🎯 Quick Start

### First Time Using Agents?

1. Read [CLAUDE.md](../../CLAUDE.md) for project context
2. Review this README for agent overview
3. Pick an agent for your task
4. Reference the agent's detailed docs
5. Invoke the agent with clear instructions
6. Run Code Reviewer before committing

### Example First Task

```
Task: Create a simple button component

1. "As Component Builder Agent, create a Button component with
   primary/secondary variants and proper TypeScript interfaces."

2. Review the generated code

3. "As Styling & Responsive Agent, ensure the Button uses CSS variables
   and has proper hover/focus states."

4. "As Code Reviewer Agent, review the Button component against
   project standards."

5. Make any required changes

6. Commit!
```

---

**Ready to build with AI agents? Pick an agent and start creating!** 🚀
