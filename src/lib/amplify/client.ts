'use client';

import { Amplify } from 'aws-amplify';
import outputs from '../../../amplify_outputs.json';

/**
 * Client-side Amplify Configuration
 *
 * Configures Amplify for client-side components.
 * Auto-imports configuration from amplify_outputs.json generated during deployment.
 *
 * Usage:
 * - Import this file in client components that use Amplify Auth/Data
 * - Alternatively, configure once in root layout
 *
 * IMPORTANT: Pass the entire outputs object to preserve model introspection data
 * needed for generateClient() to work properly.
 */

// Configure Amplify for client-side use with full outputs
// This includes model introspection data for generateClient()
Amplify.configure(outputs, {
  ssr: true, // Enable SSR support for Next.js
});

export default outputs;
