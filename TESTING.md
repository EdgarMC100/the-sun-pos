# Testing Guide - The Sun Pos

This document provides a comprehensive guide to testing in The Sun Pos project.

## Quick Start

```bash
# Run all tests
pnpm test

# Run tests in watch mode (recommended during development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI interface
pnpm test:ui
```

## Testing Stack

- **Test Runner:** [Vitest](https://vitest.dev/) - Fast, modern testing framework
- **Component Testing:** [React Testing Library](https://testing-library.com/react) - Test components like users interact with them
- **DOM Assertions:** [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) - Custom matchers for DOM elements
- **User Interactions:** [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) - Simulate user interactions
- **Environment:** [jsdom](https://github.com/jsdom/jsdom) - Simulated browser environment

## Project Structure

```
src/
├── components/
│   ├── BrandTitle.tsx
│   ├── BrandTitle.test.tsx         # Component test
│   ├── BrandTitle.module.css
│   ├── SignOutButton.tsx
│   └── SignOutButton.test.tsx      # Component test with mocks
├── lib/
│   ├── validation.ts
│   └── validation.test.ts          # Utility function tests
└── test/
    ├── setup.ts                     # Global test configuration
    └── test-utils.tsx               # Custom render helpers
```

## Writing Tests

### 1. Component Tests

**Basic Component Test:**
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import BrandTitle from './BrandTitle';

describe('BrandTitle', () => {
  it('renders the title text', () => {
    render(<BrandTitle>The Sun Pos</BrandTitle>);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Sun Pos');
  });
});
```

**Component with User Interaction:**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SignOutButton from './SignOutButton';

const mockSignOut = vi.fn();
vi.mock('@/lib/amplify/auth-helpers', () => ({
  signOutUser: () => mockSignOut(),
}));

describe('SignOutButton', () => {
  it('calls signOut when clicked', async () => {
    const user = userEvent.setup();
    mockSignOut.mockResolvedValueOnce(undefined);

    render(<SignOutButton />);

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
```

### 2. Utility Function Tests

```tsx
import { describe, it, expect } from 'vitest';
import { isValidEmail } from './validation';

describe('isValidEmail', () => {
  it('validates correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

### 3. Async Operations

```tsx
it('handles async data fetching', async () => {
  const mockFetch = vi.fn().mockResolvedValueOnce({ name: 'John' });

  render(<UserProfile fetchUser={mockFetch} />);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

## Common Mocking Patterns

### Mocking Next.js Navigation

```tsx
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### Mocking Amplify Auth Functions

```tsx
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/amplify/auth-helpers', () => ({
  signInUser: (...args) => mockSignIn(...args),
  signOutUser: () => mockSignOut(),
  getCurrentUserSession: vi.fn(),
}));
```

### Mocking Font Imports

```tsx
vi.mock('@/app/fonts', () => ({
  pacifico: {
    className: 'mock-pacifico-font',
  },
}));
```

## Testing Best Practices

### ✅ DO

1. **Test user behavior, not implementation**
   ```tsx
   // Good: Test what the user sees
   expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

   // Bad: Test implementation details
   expect(component.state.isSubmitting).toBe(false);
   ```

2. **Use semantic queries**
   ```tsx
   // Good: Accessible queries
   screen.getByRole('button', { name: /sign in/i })
   screen.getByLabelText(/username/i)

   // Bad: Non-semantic queries
   screen.getByTestId('submit-button')
   screen.getByClassName('btn-primary')
   ```

3. **Mock external dependencies**
   - Next.js router
   - AWS Amplify auth functions
   - External APIs
   - Third-party libraries

4. **Test error states**
   ```tsx
   it('displays error message on failed login', async () => {
     mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

     render(<LoginForm />);
     await user.click(screen.getByRole('button', { name: /sign in/i }));

     expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
   });
   ```

5. **Clean up between tests**
   - Vitest automatically cleans up after each test
   - Mock functions are automatically cleared

### ❌ DON'T

1. **Don't test CSS or styles**
   - Focus on functionality, not presentation

2. **Don't test third-party libraries**
   - Trust that React, Next.js, etc. work correctly

3. **Don't write dependent tests**
   ```tsx
   // Bad: Tests depend on execution order
   let userId;
   it('creates user', () => {
     userId = createUser();
   });
   it('fetches user', () => {
     fetchUser(userId); // Depends on previous test
   });
   ```

4. **Don't over-mock**
   - Only mock what's necessary
   - Test real behavior when possible

## Query Priority (React Testing Library)

1. **Accessible to everyone:**
   - `getByRole` - Most preferred
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries:**
   - `getByDisplayValue`

3. **Test IDs (last resort):**
   - `getByTestId` - Only when semantic queries don't work

## Example: Full Component Test

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

const mockSignIn = vi.fn();
const mockPush = vi.fn();

vi.mock('@/lib/amplify/auth-helpers', () => ({
  signInUser: (username, password) => mockSignIn(username, password),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ success: true });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error on failed login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'baduser');
    await user.type(screen.getByLabelText(/password/i), 'badpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
```

## Coverage Reports

Run tests with coverage:
```bash
pnpm test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - HTML report (open in browser)
- `coverage/lcov.info` - LCOV format for CI tools

### Coverage Targets

- **Business Logic:** 80%+ coverage
- **Auth Flows:** 90%+ coverage
- **Validation Functions:** 90%+ coverage
- **UI Components:** 60%+ coverage

## Continuous Integration

Before committing:
```bash
pnpm lint    # Check code style
pnpm test    # Run all tests
pnpm build   # Verify build succeeds
```

## Troubleshooting

### Tests fail with "Cannot find module"

Make sure path aliases are configured in `vitest.config.ts`:
```tsx
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Tests hang or timeout

- Check for missing `await` on async operations
- Ensure mocked functions resolve/reject properly
- Increase timeout if needed: `{ timeout: 10000 }`

### Mock not working

- Ensure `vi.mock()` is called before imports
- Clear mocks between tests: `vi.clearAllMocks()`
- Check mock implementation is correct

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Getting Help

- Check existing tests in `src/` for examples
- Review this guide and CLAUDE.md
- Ask in team channels for testing questions
