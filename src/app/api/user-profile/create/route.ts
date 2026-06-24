import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';
import type { Schema } from '@/amplify/data/resource';
import { runWithAmplifyServerContext } from '@/lib/amplify/server';

const client = generateClient<Schema>();

/**
 * Create UserProfile API Endpoint
 *
 * Called after user registration to create UserProfile record.
 * This was moved out of the postConfirmation trigger to avoid circular dependencies.
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    if (!session.tokens) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Extract user info from JWT token
    const userId = session.tokens.idToken?.payload.sub as string;
    const email = session.tokens.idToken?.payload.email as string;
    const username = session.tokens.idToken?.payload.preferred_username as string;
    const role = session.tokens.idToken?.payload['custom:role'] as string;
    const storeId = session.tokens.idToken?.payload['custom:storeId'] as string;

    if (!userId || !email || !role || !storeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required user attributes',
          details: { userId, email, role, storeId }
        },
        { status: 400 }
      );
    }

    console.log('Creating UserProfile:', { userId, username, email, role, storeId });

    // Create UserProfile record
    const result = await client.models.UserProfile.create({
      userId,
      username: username || email.split('@')[0],
      email,
      role: role as 'admin' | 'cashier',
      storeId,
      isActive: true,
    });

    if (!result.data) {
      throw new Error('Failed to create UserProfile');
    }

    console.log('UserProfile created successfully:', result.data);

    return NextResponse.json({
      success: true,
      userProfile: result.data,
    });
  } catch (error) {
    console.error('Error creating UserProfile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
