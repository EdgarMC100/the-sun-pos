import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement, Effect, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';
import { preTokenGeneration } from './functions/pre-token-generation/resource';
import { adminCreateCashier } from './functions/admin-create-cashier/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  preTokenGeneration,
  adminCreateCashier,
});

// Triggers configured in auth/resource.ts

// Grant postConfirmation permission to add users to groups
// Using wildcard resource to avoid circular dependency
backend.postConfirmation.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['cognito-idp:AdminAddUserToGroup'],
    resources: ['*'], // Wildcard to avoid circular dependency with UserPool
  })
);

// Grant admin function access to Cognito and Data
backend.adminCreateCashier.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminSetUserPassword',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminUpdateUserAttributes',
    ],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
);

// Grant access to DynamoDB for all Lambda functions
const dataPolicy = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: [
    'dynamodb:PutItem',
    'dynamodb:GetItem',
    'dynamodb:UpdateItem',
    'dynamodb:Query',
    'dynamodb:Scan',
  ],
  resources: [
    backend.data.resources.tables['UserProfile'].tableArn,
    backend.data.resources.tables['Transaction'].tableArn,
  ],
});

// Note: postConfirmation no longer creates UserProfile to avoid circular dependency
// UserProfile creation will be handled via API endpoint after registration
backend.adminCreateCashier.resources.lambda.addToRolePolicy(dataPolicy);

// Pass environment variables to Lambda functions
backend.adminCreateCashier.addEnvironment(
  'USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId
);

// Export Lambda function name for Next.js API routes
backend.addOutput({
  custom: {
    adminCreateCashierFunctionName: backend.adminCreateCashier.resources.lambda.functionName,
  },
});
