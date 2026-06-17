import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '@/lib/amplify/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * POST /api/admin/create-cashier
 *
 * Admin-only API endpoint to create cashier accounts.
 *
 * Flow:
 * 1. Validate JWT token from cookies
 * 2. Extract storeId and role from token claims
 * 3. Verify user is admin
 * 4. Invoke Lambda function with admin's storeId
 * 5. Return result to frontend
 *
 * Security:
 * - Requires valid authentication
 * - Validates admin role from JWT
 * - Passes caller's storeId to Lambda (multi-tenant isolation)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated session
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      async operation(contextSpec) {
        return await fetchAuthSession(contextSpec);
      },
    });

    // 2. Validate user is authenticated
    if (!session.tokens?.idToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - not authenticated', error: 'NOT_AUTHENTICATED' },
        { status: 401 }
      );
    }

    // 3. Extract claims from ID token
    const idToken = session.tokens.idToken;
    const payload = idToken.payload;

    const role = payload.role as string;
    const storeId = payload.storeId as string;

    console.log('Create cashier request from:', {
      username: payload.username,
      role,
      storeId,
    });

    // 4. Validate user is admin
    if (role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - admin role required', error: 'NOT_ADMIN' },
        { status: 403 }
      );
    }

    // 5. Validate storeId exists
    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin - no storeId found', error: 'INVALID_STORE' },
        { status: 400 }
      );
    }

    // 6. Parse request body
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required', error: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // 7. Invoke Lambda function with admin's storeId
    const lambdaFunctionName = process.env.ADMIN_CREATE_CASHIER_FUNCTION_NAME;

    if (!lambdaFunctionName) {
      console.error('ADMIN_CREATE_CASHIER_FUNCTION_NAME environment variable not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error', error: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }

    const lambdaPayload = {
      username,
      password,
      adminStoreId: storeId, // Pass the admin's storeId to Lambda
    };

    console.log('Invoking Lambda function:', lambdaFunctionName);

    const lambdaCommand = new InvokeCommand({
      FunctionName: lambdaFunctionName,
      Payload: JSON.stringify(lambdaPayload),
    });

    const lambdaResponse = await lambda.send(lambdaCommand);

    // 8. Parse Lambda response
    const responsePayload = JSON.parse(
      new TextDecoder().decode(lambdaResponse.Payload)
    );

    console.log('Lambda response:', responsePayload);

    // 9. Return result to client
    if (responsePayload.success) {
      return NextResponse.json({
        success: true,
        message: 'Cashier created successfully',
        username: responsePayload.username,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: responsePayload.message,
          error: responsePayload.error,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in create-cashier API:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create cashier',
        error: error.message || 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
