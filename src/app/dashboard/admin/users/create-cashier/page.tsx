'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { CashierCreationForm } from '@/components/forms/CashierCreationForm';
import Link from 'next/link';
import styles from './page.module.css';

export default function CreateCashierPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <Link href="/dashboard" className={styles.backLink}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/dashboard/admin" className={styles.backLink}>
          ← Back to Admin Dashboard
        </Link>
        <h1>Create New Cashier</h1>
        <p className={styles.description}>
          Create a new cashier account for your store. The cashier will be able to login
          with the username and password you provide.
        </p>
      </div>

      <div className={styles.formContainer}>
        <CashierCreationForm />
      </div>
    </div>
  );
}
