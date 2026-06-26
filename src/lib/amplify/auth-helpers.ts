'use client';

import { signIn, signUp, signOut, confirmSignUp, resendSignUpCode, getCurrentUser, fetchAuthSession, type SignUpInput } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

// Import client config to ensure Amplify is configured
import '@/lib/amplify/client';

/**
 * Auth Helper Functions
 *
 * Provides username-based authentication helpers that wrap Amplify Auth APIs.
 *
 * Key Features:
 * - Username resolution for login
 * - Admin registration with email verification
 * - Role-based user data extraction
 * - Custom claims parsing (role, storeId)
 */

// ============================================================================
// Types
// ============================================================================

export interface UserRole {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'cashier';
  storeId: string;
}

export interface AdminRegistrationInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
  storeName: string;
  storeType: string;
}

// ============================================================================
// Username Resolution
// ============================================================================

/**
 * Resolve username to email for Cognito sign-in
 *
 * Queries UserProfile table directly using Amplify Data client with guest credentials.
 * This allows username lookup before authentication.
 *
 * @param username - The username to resolve
 * @returns The internal email address for Cognito
 * @throws Error if username not found
 */
export async function resolveUsername(username: string): Promise<string> {
  // Normalize username
  const normalizedUsername = username.toLowerCase().trim();

  try {
    // Use IAM auth mode with guest credentials from identity pool
    // Don't pass Schema generic - models are inferred from Amplify config
    const client = generateClient({ authMode: 'iam' });

    const { data: userProfiles, errors } = await client.models.UserProfile.list({
      filter: {
        username: {
          eq: normalizedUsername,
        },
      },
      limit: 1,
    });

    if (errors || !userProfiles || userProfiles.length === 0) {
      throw new Error('Username not found');
    }

    return userProfiles[0].email;
  } catch (error: any) {
    console.error('Username resolution error:', error);
    throw new Error(error.message || 'Failed to resolve username');
  }
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Sign in with username and password
 *
 * Resolves username to email before calling Cognito signIn.
 *
 * @param username - User's username (not email)
 * @param password - User's password
 * @returns Sign-in result from Cognito
 */
export async function signInWithUsername(username: string, password: string) {
  try {
    // Resolve username to email
    const email = await resolveUsername(username);

    // Sign in with email (Cognito requirement)
    const result = await signIn({
      username: email,
      password,
    });

    return result;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Register a new admin user
 *
 * Creates admin account with email verification.
 * Generates storeId and sets custom attributes.
 *
 * @param input - Admin registration data
 * @returns Sign-up result from Cognito
 */
export async function registerAdmin(input: AdminRegistrationInput) {
  try {
    // Generate unique storeId
    const storeId = crypto.randomUUID();

    // Prepare sign-up parameters
    const signUpParams: SignUpInput = {
      username: input.email, // Cognito uses email as username for admins
      password: input.password,
      options: {
        userAttributes: {
          email: input.email,
          preferred_username: input.username,
          'custom:role': 'admin',
          'custom:storeId': storeId,
          // Note: storeName and storeType are NOT stored in Cognito
          // They will be passed to /api/admin/create-store on first login
        },
        autoSignIn: false, // Require email verification first
      },
    };

    const result = await signUp(signUpParams);

    // Store registration data in localStorage for use on first login
    // This is needed because Cognito doesn't store storeName/storeType
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingStoreData', JSON.stringify({
        name: input.storeName,
        type: input.storeType,
        storeId,
      }));
    }

    return {
      ...result,
      storeId, // Return storeId for client-side use
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
}

/**
 * Confirm email verification code
 *
 * @param email - User's email address
 * @param code - Verification code from email
 */
export async function confirmEmail(email: string, code: string) {
  try {
    const result = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });

    return result;
  } catch (error: any) {
    console.error('Email confirmation error:', error);
    throw new Error(error.message || 'Failed to confirm email');
  }
}

/**
 * Resend confirmation code to user's email
 *
 * Triggers AWS Cognito to send a new verification code.
 * Rate limited by AWS (typically 5 requests per minute).
 *
 * @param email - User's email address
 * @returns Code delivery details (masked email)
 */
export async function resendConfirmationCode(email: string) {
  try {
    const result = await resendSignUpCode({
      username: email,
    });

    return result;
  } catch (error: any) {
    console.error('Resend confirmation code error:', error);
    throw new Error(error.message || 'Failed to resend confirmation code');
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    await signOut();
  } catch (error: any) {
    console.error('Sign-out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

// ============================================================================
// User Data
// ============================================================================

/**
 * Get current authenticated user with role data
 *
 * Extracts custom claims from ID token:
 * - role (admin | cashier)
 * - storeId (UUID)
 * - username (preferred_username)
 *
 * @returns User data with role information or null if not authenticated
 */
export async function getCurrentUserData(): Promise<UserRole | null> {
  try {
    const [user, session] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession(),
    ]);

    if (!session.tokens?.idToken) {
      return null;
    }

    const idToken = session.tokens.idToken;
    const payload = idToken.payload;

    return {
      userId: user.userId,
      username: (payload.username as string) || (payload.preferred_username as string) || '',
      email: (payload.email as string) || '',
      role: (payload.role as 'admin' | 'cashier') || 'cashier',
      storeId: (payload.storeId as string) || '',
    };
  } catch (error: any) {
    // Silently return null for expected "not authenticated" errors
    if (error.name === 'UserUnAuthenticatedException' || error.message?.includes('not authenticated')) {
      return null;
    }

    // Log unexpected errors
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const userData = await getCurrentUserData();
  return userData?.role === 'admin';
}

/**
 * Check if current user is cashier
 */
export async function isCashier(): Promise<boolean> {
  const userData = await getCurrentUserData();
  return userData?.role === 'cashier';
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Create a new cashier account (Admin only)
 *
 * Calls Lambda function to create cashier with username-only credentials.
 *
 * @param username - Cashier's username
 * @param password - Cashier's password
 * @returns Success result with username
 */
export async function createCashier(username: string, password: string) {
  try {
    const response = await fetch('/api/admin/create-cashier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create cashier');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Create cashier error:', error);
    throw new Error(error.message || 'Failed to create cashier');
  }
}

// ============================================================================
// First Login Setup
// ============================================================================

/**
 * Handle first login setup - creates UserProfile and Store if needed
 *
 * This function is called after successful authentication to ensure
 * UserProfile and Store records exist. These were moved out of the
 * postConfirmation trigger to avoid circular dependencies.
 *
 * @returns Success status
 */
export async function handleFirstLogin(): Promise<{ success: boolean; error?: string }> {
  try {
    const userData = await getCurrentUserData();

    if (!userData) {
      return { success: false, error: 'Not authenticated' };
    }

    console.log('Handling first login for:', userData.username);

    // 1. Create UserProfile
    const userProfileResponse = await fetch('/api/user-profile/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!userProfileResponse.ok) {
      const error = await userProfileResponse.json();
      console.error('UserProfile creation failed:', error);
      // Don't fail if UserProfile already exists
      if (!error.details?.includes('already exists')) {
        throw new Error(error.error || 'Failed to create user profile');
      }
    } else {
      console.log('UserProfile created successfully');
    }

    // 2. If admin, create Store
    if (userData.role === 'admin') {
      // Get store data from localStorage (saved during registration)
      let storeName = 'My Store';
      let storeType = 'retail';

      if (typeof window !== 'undefined') {
        const pendingData = localStorage.getItem('pendingStoreData');
        if (pendingData) {
          try {
            const data = JSON.parse(pendingData);
            storeName = data.name || storeName;
            storeType = data.type || storeType;
            // Clear the data after reading
            localStorage.removeItem('pendingStoreData');
          } catch (e) {
            console.warn('Failed to parse pendingStoreData:', e);
          }
        }
      }

      const storeResponse = await fetch('/api/admin/create-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName,
          type: storeType,
        }),
      });

      if (!storeResponse.ok) {
        const error = await storeResponse.json();
        console.error('Store creation failed:', error);
        // Don't fail if Store already exists
        if (!error.details?.includes('already exists')) {
          throw new Error(error.error || 'Failed to create store');
        }
      } else {
        console.log('Store created successfully');
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('First login setup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete first login setup'
    };
  }
}
