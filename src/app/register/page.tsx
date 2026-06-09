'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import styles from './register.module.css';
import BrandTitle from '@/components/BrandTitle';
import { isValidEmail, isValidPassword, getPasswordStrength, type PasswordStrength } from '@/lib/validation';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  GlobeIcon,
  UserIcon,
  StoreIcon,
  TagIcon,
  ChevronDownIcon,
} from '@/components/icons';

interface FormErrors {
  fullName?: string;
  storeName?: string;
  email?: string;
  storeType?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [storeType, setStoreType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(0);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(getPasswordStrength(value));
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!storeType) {
      newErrors.storeType = 'Please select a store type';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password, 8)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // TODO: Implement actual registration logic
      console.log('Registration form submitted:', {
        fullName,
        storeName,
        email,
        storeType,
        password,
        agreeToTerms,
      });
      // Reset form or redirect after successful registration
    }
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign-up clicked');
  };

  const handleSignIn = () => {
    // TODO: Navigate to sign-in page
    console.log('Sign in clicked');
  };

  const getStrengthBarClass = (index: number): string => {
    const baseClass = styles.strengthBar;
    if (index >= passwordStrength) {
      return `${baseClass} ${styles.active}`;
    }

    switch (passwordStrength) {
      case 1:
        return `${baseClass} ${styles.weak}`;
      case 2:
        return `${baseClass} ${styles.fair}`;
      case 3:
        return `${baseClass} ${styles.good}`;
      case 4:
        return `${baseClass} ${styles.strong}`;
      default:
        return baseClass;
    }
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
                <h2 className={styles.title}>Create your account</h2>
                <p className={styles.subtitle}>Tell us a bit about you and your store to get started.</p>
              </div>

              {/* Form Fields */}
              <div className={styles.fields}>
                {/* Full Name Field */}
                <div className={styles.field}>
                  <label htmlFor="fullName" className={styles.label}>
                    Full name
                  </label>
                  <div className={styles.inputWrapper}>
                    <UserIcon className={styles.inputIcon} />
                    <input
                      id="fullName"
                      type="text"
                      className={styles.input}
                      placeholder="Jane Cooper"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) {
                          setErrors({ ...errors, fullName: undefined });
                        }
                      }}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                  </div>
                  {errors.fullName && (
                    <span id="fullName-error" className={styles.error} role="alert">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                {/* Store - Composed Field (Option C) */}
                <div className={styles.field}>
                  <label htmlFor="storeName" className={styles.label}>
                    Store
                  </label>
                  <div className={styles.composedField}>
                    {/* Type Pill - Left Segment */}
                    <div className={styles.typePill}>
                      <TagIcon className={styles.inputIcon} />
                      <select
                        id="storeType"
                        className={styles.typeSelect}
                        value={storeType}
                        onChange={(e) => {
                          setStoreType(e.target.value);
                          if (errors.storeType) {
                            setErrors({ ...errors, storeType: undefined });
                          }
                        }}
                        aria-invalid={!!errors.storeType}
                        aria-describedby={errors.storeType ? 'storeType-error' : undefined}
                      >
                        <option value="">Type</option>
                        <option value="retail">Retail</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="cafe">Café</option>
                        <option value="grocery">Grocery</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDownIcon className={styles.chevronIcon} />
                    </div>

                    {/* Divider */}
                    <div className={styles.fieldDivider}></div>

                    {/* Name Segment - Right Segment */}
                    <div className={styles.nameSegment}>
                      <StoreIcon className={styles.inputIcon} />
                      <input
                        id="storeName"
                        type="text"
                        className={styles.input}
                        placeholder="Sunny Coffee Co."
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                          if (errors.storeName) {
                            setErrors({ ...errors, storeName: undefined });
                          }
                        }}
                        aria-invalid={!!errors.storeName}
                        aria-describedby={errors.storeName ? 'storeName-error' : undefined}
                      />
                    </div>
                  </div>
                  {(errors.storeName || errors.storeType) && (
                    <span className={styles.error} role="alert">
                      {errors.storeName || errors.storeType}
                    </span>
                  )}
                </div>

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
                      placeholder="you@yourstore.com"
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
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
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

                {/* Confirm Password Field */}
                <div className={styles.field}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm password
                  </label>
                  <div className={styles.inputWrapper}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors({ ...errors, confirmPassword: undefined });
                        }
                      }}
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span id="confirmPassword-error" className={styles.error} role="alert">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthBars}>
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={getStrengthBarClass(index)}
                        />
                      ))}
                    </div>
                    <p className={styles.strengthHint}>
                      Use 8+ characters with a mix of letters, numbers, and symbols.
                    </p>
                  </div>
                )}

                {/* Terms Checkbox */}
                <div className={styles.termsRow}>
                  <div
                    className={styles.checkboxWrapper}
                    onClick={() => {
                      setAgreeToTerms(!agreeToTerms);
                      if (errors.terms) {
                        setErrors({ ...errors, terms: undefined });
                      }
                    }}
                    role="checkbox"
                    aria-checked={agreeToTerms}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setAgreeToTerms(!agreeToTerms);
                        if (errors.terms) {
                          setErrors({ ...errors, terms: undefined });
                        }
                      }
                    }}
                  >
                    {agreeToTerms && <CheckIcon className={styles.checkboxIcon} />}
                  </div>
                  <label
                    className={styles.termsLabel}
                    onClick={() => {
                      setAgreeToTerms(!agreeToTerms);
                      if (errors.terms) {
                        setErrors({ ...errors, terms: undefined });
                      }
                    }}
                  >
                    I agree to the Terms of Service and Privacy Policy.
                  </label>
                </div>
                {errors.terms && (
                  <span className={styles.error} role="alert">
                    {errors.terms}
                  </span>
                )}
              </div>

              {/* Create Account Button */}
              <button type="submit" className={styles.button}>
                Create account
              </button>

              {/* Divider */}
              <div className={styles.divider}>
                <div className={styles.dividerLine}></div>
                <span className={styles.dividerText}>OR</span>
                <div className={styles.dividerLine}></div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleSignUp}
              >
                <GlobeIcon className={styles.googleIcon} />
                Sign up with Google
              </button>

              {/* Sign In Link */}
              <div className={styles.signinRow}>
                <span className={styles.signinText}>Already have an account?</span>
                <button
                  type="button"
                  className={styles.signinLink}
                  onClick={handleSignIn}
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
