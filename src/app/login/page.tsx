'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import BrandTitle from '@/components/BrandTitle';
import { isValidUsername, isValidPassword } from '@/lib/validation';
import { signInWithUsername, handleFirstLogin } from '@/lib/amplify/auth-helpers';
import {
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
} from '@/components/icons';

interface FormErrors {
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  // Form fields (password separate for security per guidelines)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    if (!username) {
      setErrors({ general: 'Username is required' });
      return false;
    }

    if (!isValidUsername(username)) {
      setErrors({ general: 'Username must be 3-20 characters (alphanumeric, dots, underscores)' });
      return false;
    }

    if (!password) {
      setErrors({ general: 'Password is required' });
      return false;
    }

    if (!isValidPassword(password, 8)) {
      setErrors({ general: 'Password must be at least 8 characters' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithUsername(username, password);

      if (result.isSignedIn) {
        // Handle first login - create UserProfile and Store if needed
        console.log('Sign-in successful, handling first login setup...');
        const setupResult = await handleFirstLogin();

        if (!setupResult.success) {
          console.warn('First login setup had issues:', setupResult.error);
          // Don't block login - user can still access dashboard
          // The setup will retry on next page load if needed
        }

        // Success - redirect to dashboard (middleware handles role routing)
        router.push('/dashboard');
      } else if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setErrors({ general: 'Please verify your email before signing in.' });
      } else if (result.nextStep.signInStep === 'RESET_PASSWORD') {
        setErrors({ general: 'Password reset required. Please contact support.' });
      } else {
        setErrors({ general: 'Sign-in incomplete. Please try again.' });
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setErrors({ general: error.message || 'Invalid username or password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset is not yet implemented. Please contact your administrator.');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <div className={styles.container}>
      <div className={styles.split}>
        {/* Left Side - Brand Section */}
        <div className={styles.leftSide}>
          <BrandTitle>Papeleria el</BrandTitle>
          <Image
            className={styles.logo}
            src="/elsollogo.png"
            alt="El Sol Logo"
            width={350}
            height={350}
            priority
          />
        </div>

        {/* Right Side - Form Section */}
        <div className={styles.rightSide}>
          <div className={styles.formWrapper}>
            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Form Header */}
              <div className={styles.header}>
                <h2 className={styles.title}>Welcome back</h2>
                <p className={styles.subtitle}>Please enter your details to sign in.</p>
              </div>

              {/* Success Message for Email Verification */}
              {verified === 'true' && (
                <div className={styles.successMessage} role="alert">
                  ✓ Email verified successfully! You can now sign in.
                </div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div className={styles.generalError} role="alert">
                  {errors.general}
                </div>
              )}

              {/* Form Fields */}
              <div className={styles.fields}>
                {/* Username Field */}
                <div className={styles.field}>
                  <label htmlFor="username" className={styles.label}>
                    Username
                  </label>
                  <div className={styles.inputWrapper}>
                    <UserIcon className={styles.inputIcon} />
                    <input
                      id="username"
                      type="text"
                      className={styles.input}
                      placeholder="your.username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errors.general) {
                          setErrors({});
                        }
                      }}
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className={styles.field}>
                  <div className={styles.labelRow}>
                    <label htmlFor="password" className={styles.label}>
                      Password
                    </label>
                    <button
                      type="button"
                      className={styles.forgotLink}
                      onClick={handleForgotPassword}
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.general) {
                          setErrors({});
                        }
                      }}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className={styles.checkboxRow}>
                  <div
                    className={styles.checkboxWrapper}
                    onClick={() => setRememberMe(!rememberMe)}
                    role="checkbox"
                    aria-checked={rememberMe}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setRememberMe(!rememberMe);
                      }
                    }}
                  >
                    {rememberMe && <CheckIcon className={styles.checkboxIcon} />}
                  </div>
                  <label
                    className={styles.checkboxLabel}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    Remember me for 30 days
                  </label>
                </div>
              </div>

              {/* Sign In Button */}
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Sign Up Link */}
              <div className={styles.signupRow}>
                <span className={styles.signupText}>Don&apos;t have an account?</span>
                <button
                  type="button"
                  className={styles.signupLink}
                  onClick={handleSignUp}
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
