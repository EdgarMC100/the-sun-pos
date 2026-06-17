import { NextRequest, NextResponse } from 'next/server';
import { generateServerClientUsingReqRes } from '@aws-amplify/adapter-nextjs/api';
import { type Schema } from '@/amplify/data/resource';
import { cookies } from 'next/headers';
import outputs from '@/amplify_outputs.json';

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

    // Create server-side GraphQL client
    const cookieStore = await cookies();
    const { client } = generateServerClientUsingReqRes<Schema>({
      config: outputs,
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value ?? '',
      },
    });

    // Query UserProfile by username
    // Note: This requires a GSI (Global Secondary Index) on username field
    const { data: userProfiles, errors } = await client.models.UserProfile.list({
      filter: {
        username: {
          eq: normalizedUsername,
        },
      },
      limit: 1,
    });

    if (errors || !userProfiles || userProfiles.length === 0) {
      return NextResponse.json(
        { message: 'Username not found' },
        { status: 404 }
      );
    }

    const userProfile = userProfiles[0];

    // Return internal email for Cognito
    return NextResponse.json({
      email: userProfile.email,
    });
  } catch (error: any) {
    console.error('Username resolution error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
