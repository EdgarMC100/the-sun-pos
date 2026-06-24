import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  timeoutSeconds: 30,
  resourceGroupName: 'auth', // Assign to auth stack to avoid circular dependency
});
