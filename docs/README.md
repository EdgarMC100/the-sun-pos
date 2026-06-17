# The Sun Pos - Technical Documentation

## 📚 Documentation Structure

```
docs/
├── README.md                          # You are here
└── architecture/
    └── authentication/
        ├── pre-token-generation-flow.md      # JWT token enhancement flow
        └── admin-create-cashier-flow.md      # Email-less cashier creation flow
```

## 🏗️ Architecture Documentation

### Authentication

The authentication system uses AWS Amplify Gen 2 with Cognito, implementing username-based authentication with custom Lambda triggers.

- **[Pre-Token Generation Flow](./architecture/authentication/pre-token-generation-flow.md)**
  Explains how custom claims (role, storeId, username) are injected into JWT tokens for role-based access control and multi-tenant isolation.

- **[Admin Create Cashier Flow](./architecture/authentication/admin-create-cashier-flow.md)**
  Explains how cashiers are created without email addresses using internal email format and Lambda function.

## 🎨 Viewing Diagrams

All diagrams use [Mermaid](https://mermaid.js.org/) syntax for sequence diagrams and flowcharts.

**To visualize:**
1. Copy the Mermaid code block from any `.md` file
2. Paste into [Mermaid Live Editor](https://mermaid.live/)
3. View the rendered diagram

**Alternative viewers:**
- VS Code: Install "Markdown Preview Mermaid Support" extension
- GitHub: Renders Mermaid automatically in markdown files
- JetBrains IDEs: Built-in Mermaid support in markdown preview

## 📖 Project Documentation

For project-level documentation, see:
- [CLAUDE.md](../CLAUDE.md) - AI development context and coding standards
- [PRD.md](../PRD.md) - Product requirements and user personas
- [AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md](../AMPLIFY_GEN2_IMPLEMENTATION_PLAN.md) - Backend implementation plan
- [AGENTS_SPEC.md](../AGENTS_SPEC.md) - Agent-specific development guidelines

## 🔄 Contributing to Documentation

When adding new technical documentation:

1. **Architecture decisions** → `docs/architecture/[topic]/`
2. **API documentation** → `docs/api/`
3. **Deployment guides** → `docs/deployment/`
4. **Development guides** → `docs/guides/`

### Naming Conventions

- Use kebab-case for file names: `pre-token-generation-flow.md`
- Include diagrams inline with Mermaid code blocks
- Add a table of contents for docs > 200 lines
- Always include practical examples

---

**Last Updated:** 2025-01-XX
**Maintained by:** Engineering Team
