import { defineBackend } from '@aws-amplify/backend';
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

// Add custom claims to ID token via Lambda trigger
backend.auth.resources.userPool.addPropertyOverride(
  'LambdaConfig.PreTokenGeneration',
  backend.preTokenGeneration.resources.lambda.functionArn
);

backend.auth.resources.userPool.addPropertyOverride(
  'LambdaConfig.PostConfirmation',
  backend.postConfirmation.resources.lambda.functionArn
);

// Grant Lambda functions permission to invoke
backend.preTokenGeneration.resources.lambda.addPermission('PreTokenGenerationInvoke', {
  principal: 'cognito-idp.amazonaws.com',
  sourceArn: backend.auth.resources.userPool.userPoolArn,
});

backend.postConfirmation.resources.lambda.addPermission('PostConfirmationInvoke', {
  principal: 'cognito-idp.amazonaws.com',
  sourceArn: backend.auth.resources.userPool.userPoolArn,
});

// Grant admin function access to Cognito and Data
backend.adminCreateCashier.resources.lambda.addToRolePolicy(
  new (await import('@aws-cdk/aws-iam')).PolicyStatement({
    effect: (await import('@aws-cdk/aws-iam')).Effect.ALLOW,
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
const dataPolicy = new (await import('@aws-cdk/aws-iam')).PolicyStatement({
  effect: (await import('@aws-cdk/aws-iam')).Effect.ALLOW,
  actions: [
    'dynamodb:PutItem',
    'dynamodb:GetItem',
    'dynamodb:UpdateItem',
    'dynamodb:Query',
    'dynamodb:Scan',
  ],
  resources: [
    backend.data.resources.tables['Store'].tableArn,
    backend.data.resources.tables['UserProfile'].tableArn,
    backend.data.resources.tables['Transaction'].tableArn,
  ],
});

backend.postConfirmation.resources.lambda.addToRolePolicy(dataPolicy);
backend.adminCreateCashier.resources.lambda.addToRolePolicy(dataPolicy);
