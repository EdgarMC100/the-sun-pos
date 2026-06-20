'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CashierDashboardPage() {
  const { user, isCashier, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!isCashier) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <button onClick={() => router.push('/dashboard')} className={styles.button}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const username = user?.username || 'Cashier';

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brandSection}>
            <h1 className={styles.brandName}>The Sun Pos</h1>
            <span className={styles.subtitle}>Point of Sale</span>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <span className={styles.userLabel}>Cashier:</span>
              <span className={styles.username}>{username}</span>
            </div>
            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main POS Interface */}
      <main className={styles.main}>
        <div className={styles.posContainer}>
          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <button className={styles.actionCard} disabled>
                <span className={styles.actionIcon}>🛒</span>
                <span className={styles.actionTitle}>New Transaction</span>
                <span className={styles.comingSoon}>Coming Soon</span>
              </button>
              <button className={styles.actionCard} disabled>
                <span className={styles.actionIcon}>📋</span>
                <span className={styles.actionTitle}>My Transactions</span>
                <span className={styles.comingSoon}>Coming Soon</span>
              </button>
              <button className={styles.actionCard} disabled>
                <span className={styles.actionIcon}>📊</span>
                <span className={styles.actionTitle}>Today's Summary</span>
                <span className={styles.comingSoon}>Coming Soon</span>
              </button>
            </div>
          </section>

          {/* Transaction History Preview */}
          <section className={styles.recentTransactions}>
            <h2>Recent Transactions</h2>
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>📝</p>
              <p className={styles.emptyText}>No transactions yet</p>
              <p className={styles.emptySubtext}>
                Start creating transactions to see them here
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 The Sun Pos • POS System</p>
      </footer>
    </div>
  );
}
