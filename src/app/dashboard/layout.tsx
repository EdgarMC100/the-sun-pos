import { ReactNode } from 'react';
import SignOutButton from '@/components/SignOutButton';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      {/* Dashboard Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.branding}>
            <h1 className={styles.title}>The Sun Pos</h1>
          </div>

          <nav className={styles.nav}>
            <SignOutButton />
          </nav>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
