import type { PreTokenGenerationTriggerHandler } from 'aws-lambda';

/**
 * Pre-Token Generation Lambda Trigger
 *
 * Adds custom claims to the ID token:
 * - custom:role (admin or cashier)
 * - custom:storeId (UUID for multi-tenant isolation)
 * - preferred_username (for display in UI)
 *
 * These claims are used for:
 * - Role-based access control in the frontend
 * - Multi-tenant data filtering in AppSync
 * - User identification without exposing internal emails
 */
export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  const {
    request: { userAttributes },
  } = event;

  console.log('Pre-token generation trigger:', {
    username: userAttributes.preferred_username,
    role: userAttributes['custom:role'],
    storeId: userAttributes['custom:storeId'],
  });

  // Add custom claims to ID token
  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        // Add role for role-based access control
        role: userAttributes['custom:role'] || 'cashier',
        // Add storeId for multi-tenant isolation
        storeId: userAttributes['custom:storeId'] || '',
        // Add username for display (not internal email)
        username: userAttributes.preferred_username || userAttributes.email,
      },
    },
  };

  return event;
};
