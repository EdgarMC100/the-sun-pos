import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import SignOutButton from './SignOutButton';

// Mock the auth helpers
const mockSignOutUser = vi.fn();
vi.mock('@/lib/amplify/auth-helpers', () => ({
  signOutUser: () => mockSignOutUser(),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SignOutButton', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the sign out button with correct text', () => {
    render(<SignOutButton />);

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('calls signOutUser and redirects on successful sign out', async () => {
    const user = userEvent.setup();
    mockSignOutUser.mockResolvedValueOnce(undefined);

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockSignOutUser).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('shows loading state while signing out', async () => {
    const user = userEvent.setup();
    mockSignOutUser.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });
    await user.click(button);

    // Check for loading state
    expect(screen.getByText('Signing out...')).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Wait for sign out to complete
    await waitFor(() => {
      expect(mockSignOutUser).toHaveBeenCalled();
    });
  });

  it('handles sign out error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Sign out failed');
    mockSignOutUser.mockRejectedValueOnce(error);

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to sign out:', error);
      expect(mockPush).not.toHaveBeenCalled();
    });

    // Button should be enabled again after error
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('prevents multiple clicks while signing out', async () => {
    const user = userEvent.setup();
    mockSignOutUser.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: /sign out/i });

    // Click multiple times
    await user.click(button);
    await user.click(button);
    await user.click(button);

    await waitFor(() => {
      expect(mockSignOutUser).toHaveBeenCalledTimes(1);
    });
  });

  it('has correct accessibility attributes', () => {
    render(<SignOutButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Sign out');
  });
});
