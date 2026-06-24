import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';
import type { Schema } from '@/amplify/data/resource';
import { runWithAmplifyServerContext } from '@/lib/amplify/server';

const client = generateClient<Schema>();

/**
 * Create Store API Endpoint
 *
 * Called after admin registration to create Store record.
 * This was moved out of the postConfirmation trigger to avoid circular dependencies.
 *
 * Only admins can call this endpoint.
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
    const groups = session.tokens.idToken?.payload['cognito:groups'] as string[] | undefined;
    const storeId = session.tokens.idToken?.payload['custom:storeId'] as string;
    const email = session.tokens.idToken?.payload.email as string;

    // Verify user is admin
    if (!groups?.includes('Admin')) {
      return NextResponse.json(
        { success: false, error: 'Only admins can create stores' },
        { status: 403 }
      );
    }

    if (!storeId || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required attributes' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, type } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Store name is required' },
        { status: 400 }
      );
    }

    console.log('Creating Store:', { storeId, name, type, ownerEmail: email });

    // Create Store record
    const result = await client.models.Store.create({
      storeId,
      name,
      type: type || 'retail',
      ownerEmail: email,
    });

    if (!result.data) {
      throw new Error('Failed to create Store');
    }

    console.log('Store created successfully:', result.data);

    return NextResponse.json({
      success: true,
      store: result.data,
    });
  } catch (error) {
    console.error('Error creating Store:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
