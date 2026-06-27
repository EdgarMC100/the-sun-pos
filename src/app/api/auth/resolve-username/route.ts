import { NextRequest, NextResponse } from 'next/server';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import { runWithAmplifyServerContext } from '@/lib/amplify/server';
import { cookies } from 'next/headers';
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

    // Query UserProfile by username using server context
    // Note: This requires a GSI (Global Secondary Index) on username field
    // Uses IAM auth mode for unauthenticated access (pre-login)

    // Configure Amplify for server-side use
    Amplify.configure(outputs, { ssr: true });

    const result = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      async operation(contextSpec) {
        const client = generateClient<Schema>(contextSpec, { authMode: 'iam' });
        return await client.models.UserProfile.list({
          filter: {
            username: {
              eq: normalizedUsername,
            },
          },
          limit: 1,
        });
      },
    });

    const { data: userProfiles, errors } = result;

    // If UserProfile exists, return email from there
    if (!errors && userProfiles && userProfiles.length > 0) {
      return NextResponse.json({
        email: userProfiles[0].email,
      });
    }

    // Fallback: Query Cognito for first-time users (UserProfile created after first login)
    // This allows users to login with username even before UserProfile exists
    console.log('UserProfile not found, querying Cognito as fallback...');

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
