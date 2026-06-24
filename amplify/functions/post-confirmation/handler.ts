import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});

/**
 * Post-Confirmation Lambda Trigger
 *
 * Executes after user confirms their email (for admins) or is created (for cashiers)
 *
 * Responsibilities:
 * 1. Add user to appropriate Cognito group (Admin/Cashier)
 *
 * Note: UserProfile and Store creation are handled separately via API
 * to avoid circular dependencies between auth and data stacks
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  const {
    userName,
    request: { userAttributes },
    userPoolId,
  } = event;

  const userId = userAttributes.sub;
  const email = userAttributes.email;
  const username = userAttributes.preferred_username || userName;
  const role = userAttributes['custom:role'] as 'admin' | 'cashier';
  const storeId = userAttributes['custom:storeId'];

  console.log('Post-confirmation trigger:', {
    userId,
    username,
    role,
    storeId,
  });

  try {
    // 1. Add user to Cognito group based on role
    const groupName = role === 'admin' ? 'Admin' : 'Cashier';
    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: userName,
        GroupName: groupName,
      })
    );
    console.log(`User added to ${groupName} group`);
    console.log('UserProfile creation will be handled via API endpoint');

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    throw error;
  }
};
