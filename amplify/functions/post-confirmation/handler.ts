import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({});

/**
 * Post-Confirmation Lambda Trigger
 *
 * Executes after user confirms their email (for admins) or is created (for cashiers)
 *
 * Responsibilities:
 * 1. Add user to appropriate Cognito group (Admin/Cashier)
 * 2. Create UserProfile record in DynamoDB
 * 3. If admin: Create Store record
 * 4. Link users to their store via storeId
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

    // 2. If this is an admin, create Store record first
    if (role === 'admin') {
      const storeTableName = process.env.STORE_TABLE_NAME;
      if (!storeTableName) {
        throw new Error('STORE_TABLE_NAME environment variable not set');
      }

      await dynamoDb.send(
        new PutCommand({
          TableName: storeTableName,
          Item: {
            storeId,
            name: userAttributes['custom:storeName'] || 'My Store',
            type: userAttributes['custom:storeType'] || 'retail',
            ownerEmail: email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
      );
      console.log('Store created:', storeId);
    }

    // 3. Create UserProfile record
    const userProfileTableName = process.env.USER_PROFILE_TABLE_NAME;
    if (!userProfileTableName) {
      throw new Error('USER_PROFILE_TABLE_NAME environment variable not set');
    }

    await dynamoDb.send(
      new PutCommand({
        TableName: userProfileTableName,
        Item: {
          userId,
          username,
          email,
          role,
          storeId,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
    console.log('UserProfile created:', userId);

    return event;
  } catch (error) {
    console.error('Error in post-confirmation trigger:', error);
    throw error;
  }
};
