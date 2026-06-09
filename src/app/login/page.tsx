'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import styles from './login.module.css';
import BrandTitle from '@/components/BrandTitle';
import { isValidEmail, isValidPassword } from '@/lib/validation';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  GlobeIcon,
} from '@/components/icons';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password, 8)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // TODO: Implement actual authentication logic
      console.log('Form submitted:', {
        email,
        password,
        rememberMe,
      });
      // Reset form or redirect after successful login
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign-in clicked');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password clicked');
  };

  const handleSignUp = () => {
    // TODO: Navigate to sign-up page
    console.log('Sign up clicked');
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

              {/* Form Fields */}
              <div className={styles.fields}>
                {/* Email Field */}
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <div className={styles.inputWrapper}>
                    <MailIcon className={styles.inputIcon} />
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors({ ...errors, email: undefined });
                        }
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <span id="email-error" className={styles.error} role="alert">
                      {errors.email}
                    </span>
                  )}
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
                        if (errors.password) {
                          setErrors({ ...errors, password: undefined });
                        }
                      }}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <span id="password-error" className={styles.error} role="alert">
                      {errors.password}
                    </span>
                  )}
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
              <button type="submit" className={styles.button}>
                Sign in
              </button>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>OR</span>
                <div className={styles.dividerLine}></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleSignIn}
              >
                <GlobeIcon className={styles.googleIcon} />
                Continue with Google
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
