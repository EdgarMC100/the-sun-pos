import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../../amplify_outputs.json';

/**
 * Username Resolution API Endpoint
 *
 * Resolves username to internal email address for Cognito authentication.
 *
 * Flow:
 * 1. User enters username in login form
 * 2. Frontend calls this endpoint: POST { username }
 * 3. Query UserProfile table by username index
 * 4. Return internal email for Cognito signIn
 *
 * Security:
 * - Public endpoint (pre-authentication)
 * - Rate limiting recommended (future enhancement)
 * - Returns only email, no sensitive data
 */

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    // Validate input
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    // Normalize username (lowercase, trim)
    const normalizedUsername = username.toLowerCase().trim();

    // Query Cognito directly for username resolution
    // Cognito is the source of truth for user credentials (pre-authentication)
    // UserProfile table is for application data AFTER login
    console.log('Resolving username via Cognito...');

    try {
      const cognito = new CognitoIdentityProviderClient({ region: outputs.auth.aws_region });
      const listUsersResult = await cognito.send(
        new ListUsersCommand({
          UserPoolId: outputs.auth.user_pool_id,
          Filter: `preferred_username = "${normalizedUsername}"`,
          Limit: 1,
        })
      );

      if (!listUsersResult.Users || listUsersResult.Users.length === 0) {
        return NextResponse.json(
          { message: 'Username not found. Please check your username or use your email address.' },
          { status: 404 }
        );
      }

      const user = listUsersResult.Users[0];
      const emailAttribute = user.Attributes?.find(attr => attr.Name === 'email');

      if (!emailAttribute || !emailAttribute.Value) {
        return NextResponse.json(
          { message: 'Email not found for user' },
          { status: 404 }
        );
      }

      console.log('Username resolved from Cognito successfully');
      return NextResponse.json({
        email: emailAttribute.Value,
      });
    } catch (cognitoError: any) {
      console.error('Cognito query error:', cognitoError);
      return NextResponse.json(
        { message: 'Failed to resolve username. Please try using your email address.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Username resolution error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
