import { redirect } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/lib/amplify/server';
import { cookies } from 'next/headers';

/**
 * Dashboard Router
 *
 * Redirects users to their role-specific dashboard:
 * - Admins → /dashboard/admin
 * - Cashiers → /dashboard/cashier
 */
export default async function DashboardPage() {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    const idToken = session.tokens?.idToken;

    if (!idToken) {
      redirect('/login');
    }

    const role = idToken.payload['custom:role'] as string;

    // Redirect based on role
    if (role === 'admin') {
      redirect('/dashboard/admin');
    } else if (role === 'cashier') {
      redirect('/dashboard/cashier');
    } else {
      // Unknown role - redirect to login
      redirect('/login');
    }
  } catch (error) {
    console.error('Dashboard redirect error:', error);
    redirect('/login');
  }
}