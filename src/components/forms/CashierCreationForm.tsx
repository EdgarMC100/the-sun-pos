'use client';

import { useState } from 'react';
import { createCashier } from '@/lib/amplify/auth-helpers';
import styles from './CashierCreationForm.module.css';

interface CashierCredentials {
  username: string;
  password: string;
  email: string;
}

export function CashierCreationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<CashierCredentials | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await createCashier(username, password);
      setCredentials(result);
      // Clear form
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cashier');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!credentials) return;

    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard!');
  };

  if (credentials) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successMessage}>
          <h2>✅ Cashier Created Successfully</h2>
          <div className={styles.credentials}>
            <div className={styles.credentialRow}>
              <span className={styles.label}>Username:</span>
              <span className={styles.value}>{credentials.username}</span>
            </div>
            <div className={styles.credentialRow}>
              <span className={styles.label}>Password:</span>
              <span className={styles.value}>{credentials.password}</span>
            </div>
            <div className={styles.credentialRow}>
              <span className={styles.label}>Internal Email:</span>
              <span className={styles.valueSmall}>{credentials.email}</span>
            </div>
          </div>

          <div className={styles.warning}>
            ⚠️ <strong>Important:</strong> Copy or print these credentials now.
            The cashier will need them to login. This is the only time the password will be displayed.
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleCopy}
              className={styles.copyButton}
            >
              📋 Copy Credentials
            </button>
            <button
              onClick={handlePrint}
              className={styles.printButton}
            >
              🖨️ Print Credentials
            </button>
            <button
              onClick={() => setCredentials(null)}
              className={styles.createAnotherButton}
            >
              ➕ Create Another Cashier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Create New Cashier</h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9._-]+"
            placeholder="e.g., juan.cajero"
            disabled={loading}
            className={styles.input}
          />
          <span className={styles.hint}>
            Alphanumeric characters, dots, underscores, and hyphens only (3-20 characters)
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Minimum 8 characters"
            disabled={loading}
            className={styles.input}
          />
          <span className={styles.hint}>
            Minimum 8 characters, with uppercase, lowercase, and numbers
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating...' : 'Create Cashier'}
        </button>
      </form>
    </div>
  );
}
