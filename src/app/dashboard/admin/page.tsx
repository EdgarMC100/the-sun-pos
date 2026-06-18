'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './AdminDashboard.module.css';

/**
 * Admin Dashboard
 *
 * Main dashboard for store admins/owners.
 *
 * Features:
 * - Store information display
 * - Quick access to user management
 * - Transaction summary (future)
 * - Store settings (future)
 */
export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  // Handle loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login');
    return null;
  }

  // Redirect if not admin
  if (!isAdmin) {
    router.push('/dashboard/cashier');
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p className={styles.welcome}>
          Welcome back, <strong>{user.username}</strong>
        </p>
      </header>

      <div className={styles.grid}>
        {/* Store Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>🏪 Store Information</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Store ID:</span>
              <span className={styles.value}>{user.storeId}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Role:</span>
              <span className={styles.badge}>{user.role}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email}</span>
            </div>
          </div>
        </div>

        {/* User Management Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>👥 User Management</h2>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.description}>
              Manage cashiers and user accounts for your store.
            </p>
            <Link
              href="/dashboard/admin/users/create-cashier"
              className={styles.primaryButton}
            >
              ➕ Create New Cashier
            </Link>
          </div>
        </div>

        {/* Transactions Card (Future) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📊 Transactions</h2>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.description}>
              View and manage all store transactions.
            </p>
            <div className={styles.comingSoon}>
              Coming Soon
            </div>
          </div>
        </div>

        {/* Settings Card (Future) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>⚙️ Settings</h2>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.description}>
              Configure store settings and preferences.
            </p>
            <div className={styles.comingSoon}>
              Coming Soon
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <Link
            href="/dashboard/admin/users/create-cashier"
            className={styles.actionButton}
          >
            <span className={styles.actionIcon}>👤</span>
            <span className={styles.actionText}>Add Cashier</span>
          </Link>
          <button className={styles.actionButton} disabled>
            <span className={styles.actionIcon}>📈</span>
            <span className={styles.actionText}>View Reports</span>
          </button>
          <button className={styles.actionButton} disabled>
            <span className={styles.actionIcon}>⚙️</span>
            <span className={styles.actionText}>Store Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
