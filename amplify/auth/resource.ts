import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true, // Required by Amplify Gen 2
  },
  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
    // Custom attributes for role-based access
    'custom:role': {
      dataType: 'String',
      mutable: false, // Role shouldn't change after creation
    },
    'custom:storeId': {
      dataType: 'String',
      mutable: false, // Store association shouldn't change
    },
  },
  accountRecovery: 'EMAIL_ONLY',
  multifactor: {
    mode: 'OPTIONAL',
    sms: false,
    totp: false,
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialCharacters: false,
  },
  groups: ['Admin', 'Cashier'],
  triggers: {
    // Will be configured in backend.ts
    preTokenGeneration: true,
    postConfirmation: true,
  },
});
