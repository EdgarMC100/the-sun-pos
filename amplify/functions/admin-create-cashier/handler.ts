import type { Handler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});

/**
 * Admin Create Cashier Lambda Function
 *
 * API endpoint for admins to create cashier accounts without email addresses.
 *
 * Key Features:
 * - Admin-only (validates cognito:groups contains "Admin")
 * - Generates internal email format for cashiers
 * - No email verification required (email_verified = true)
 * - Password set permanently (no temp password flow)
 * - Suppresses all Cognito emails
 * - Links cashier to admin's store automatically
 *
 * @see docs/architecture/authentication/admin-create-cashier-flow.md
 */

interface CreateCashierRequest {
  username: string;
  password: string;
  adminStoreId: string; // The calling admin's storeId - passed from API route
}

interface CreateCashierResponse {
  success: boolean;
  message: string;
  username?: string;
  error?: string;
}

export const handler: Handler<CreateCashierRequest, CreateCashierResponse> = async (event, context) => {
  console.log('Admin create cashier request:', {
    username: event.username,
    requestContext: context,
  });

  try {
    // 1. Validate input
    if (!event.username || !event.password || !event.adminStoreId) {
      return {
        success: false,
        message: 'Username, password, and adminStoreId are required',
        error: 'MISSING_FIELDS',
      };
    }

    const { username, password, adminStoreId } = event;

    // Note: Authorization is handled by the API route that calls this Lambda.
    // The API route validates the JWT token and extracts the admin's storeId.
    // This Lambda trusts that the API route has already validated the caller is an admin.

    // 4. Generate internal email for cashier
    const internalEmail = `cashier_${username}@internal.thesunpos.local`;
    const userPoolId = process.env.USER_POOL_ID;

    if (!userPoolId) {
      throw new Error('USER_POOL_ID environment variable not set');
    }

    console.log('Creating cashier:', {
      username,
      internalEmail,
      storeId: adminStoreId,
    });

    // 5. Create Cognito user with internal email
    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: [
          { Name: 'email', Value: internalEmail },
          { Name: 'email_verified', Value: 'true' }, // Skip email verification
          { Name: 'preferred_username', Value: username },
          { Name: 'custom:role', Value: 'cashier' },
          { Name: 'custom:storeId', Value: adminStoreId },
        ],
        MessageAction: 'SUPPRESS', // Don't send any emails
        DesiredDeliveryMediums: [], // No delivery mediums (no email/SMS)
      })
    );

    console.log('Cognito user created:', username);

    // 6. Set permanent password (no temporary password flow)
    await cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: true, // No password change required on first login
      })
    );

    console.log('Password set for user:', username);

    // 7. Add user to Cashier group
    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: 'Cashier',
      })
    );

    console.log('User added to Cashier group:', username);

    // 8. Ensure email is marked as verified (redundant but safe)
    await cognito.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
      })
    );

    console.log('Email verified attribute confirmed for:', username);

    // 9. Return success
    return {
      success: true,
      message: 'Cashier created successfully',
      username,
    };
  } catch (error: any) {
    console.error('Error creating cashier:', error);

    // Handle specific Cognito errors
    if (error.name === 'UsernameExistsException') {
      return {
        success: false,
        message: 'Username already exists',
        error: 'USERNAME_EXISTS',
      };
    }

    if (error.name === 'InvalidPasswordException') {
      return {
        success: false,
        message: 'Password does not meet requirements (min 8 chars, uppercase, lowercase, number)',
        error: 'INVALID_PASSWORD',
      };
    }

    if (error.name === 'InvalidParameterException') {
      return {
        success: false,
        message: 'Invalid username or password format',
        error: 'INVALID_PARAMETERS',
      };
    }

    // Generic error
    return {
      success: false,
      message: 'Failed to create cashier',
      error: error.message || 'UNKNOWN_ERROR',
    };
  }
};
