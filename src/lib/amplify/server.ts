import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { cookies } from 'next/headers';
import outputs from '../../../amplify_outputs.json';

/**
 * Server-side Amplify Runner
 *
 * Creates a server-side runner for Amplify operations in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 * - Middleware
 *
 * @see https://docs.amplify.aws/react/build-a-backend/server-side-rendering/
 */

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

/**
 * Get server-side auth session
 *
 * Usage in Server Components:
 * ```ts
 * const session = await getServerAuthSession();
 * if (!session.tokens) {
 *   redirect('/login');
 * }
 * ```
 */
export async function getServerAuthSession() {
  const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth/server');

  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    async operation(contextSpec) {
      try {
        const session = await fetchAuthSession(contextSpec);
        const user = await getCurrentUser(contextSpec);

        return {
          user,
          session,
          tokens: session.tokens,
          isAuthenticated: !!session.tokens,
        };
      } catch (error) {
        console.error('Error fetching auth session:', error);
        return {
          user: null,
          session: null,
          tokens: null,
          isAuthenticated: false,
        };
      }
    },
  });
}
