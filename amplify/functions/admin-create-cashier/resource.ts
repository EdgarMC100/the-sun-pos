import { defineFunction } from '@aws-amplify/backend';

export const adminCreateCashier = defineFunction({
  name: 'admin-create-cashier',
  entry: './handler.ts',
  resourceGroupName: 'data', // Assign to data stack since it's called by API
  environment: {
    USER_POOL_ID: process.env.USER_POOL_ID || '',
  },
});
