'use client';

import { Amplify, ResourcesConfig } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

/**
 * Client-side Amplify Configuration
 *
 * Configures Amplify for client-side components.
 * Auto-imports configuration from amplify_outputs.json generated during deployment.
 *
 * Usage:
 * - Import this file in client components that use Amplify Auth/Data
 * - Alternatively, configure once in root layout
 */

// Type-safe configuration from Amplify Gen 2 outputs
const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,
      identityPoolId: outputs.auth.identity_pool_id,
      loginWith: {
        email: true, // Required by Amplify Gen 2
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        preferred_username: {
          required: false,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: outputs.data.url,
      region: outputs.data.aws_region,
      defaultAuthMode: 'userPool',
    },
  },
};

// Configure Amplify for client-side use
Amplify.configure(amplifyConfig, {
  ssr: true, // Enable SSR support for Next.js
});

export default amplifyConfig;
