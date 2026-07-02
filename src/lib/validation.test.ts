import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUsername,
  getPasswordStrength,
  EMAIL_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
} from './validation';

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('admin+tag@company.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
    });
  });

  describe('EMAIL_REGEX', () => {
    it('matches valid email patterns', () => {
      expect(EMAIL_REGEX.test('admin@test.com')).toBe(true);
    });
  });
});

describe('Password Validation', () => {
  describe('isValidPassword', () => {
    it('validates passwords meeting minimum length', () => {
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('VeryL0ngP@ssw0rd!')).toBe(true);
    });

    it('rejects passwords below minimum length', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
    });

    it('respects custom minimum length', () => {
      expect(isValidPassword('12345', 5)).toBe(true);
      expect(isValidPassword('1234', 5)).toBe(false);
      expect(isValidPassword('passwordlonger', 12)).toBe(true);
    });
  });

  describe('getPasswordStrength', () => {
    it('returns 0 for empty password', () => {
      expect(getPasswordStrength('')).toBe(0);
    });

    it('returns 1 for weak passwords (8+ chars only)', () => {
      expect(getPasswordStrength('password')).toBe(1);
      expect(getPasswordStrength('abcdefgh')).toBe(1);
    });

    it('returns 2 for passwords with length and mixed case', () => {
      expect(getPasswordStrength('Password')).toBe(2);
    });

    it('returns 3 for passwords with length, mixed case, and numbers', () => {
      expect(getPasswordStrength('Password1')).toBe(3);
    });

    it('returns 4 for strong passwords with all criteria', () => {
      expect(getPasswordStrength('P@ssw0rd123')).toBe(4);
      expect(getPasswordStrength('MyStr0ng!Pass')).toBe(4);
    });

    it('caps strength at 4 even with extra length', () => {
      expect(getPasswordStrength('VeryLongP@ssw0rdWithAllCriteria123!')).toBe(4);
    });
  });
});

describe('Phone Validation', () => {
  describe('isValidPhone', () => {
    it('validates various phone number formats', () => {
      expect(isValidPhone('555-000-0000')).toBe(true);
      expect(isValidPhone('5550000000')).toBe(true);
      expect(isValidPhone('+15550000000')).toBe(true);
      expect(isValidPhone('+1-555-0000000')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('12')).toBe(false); // Too short
    });
  });

  describe('PHONE_REGEX', () => {
    it('matches valid phone patterns', () => {
      expect(PHONE_REGEX.test('+15550000000')).toBe(true);
    });
  });
});

describe('Username Validation', () => {
  describe('isValidUsername', () => {
    it('validates correct usernames', () => {
      expect(isValidUsername('john.doe')).toBe(true);
      expect(isValidUsername('user_123')).toBe(true);
      expect(isValidUsername('admin2024')).toBe(true);
      expect(isValidUsername('test.user_1')).toBe(true);
    });

    it('rejects usernames that are too short', () => {
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('a')).toBe(false);
      expect(isValidUsername('')).toBe(false);
    });

    it('rejects usernames that are too long', () => {
      expect(isValidUsername('a'.repeat(21))).toBe(false);
      expect(isValidUsername('verylongusernamethatexceedslimit')).toBe(false);
    });

    it('rejects usernames with invalid characters', () => {
      expect(isValidUsername('user@name')).toBe(false);
      expect(isValidUsername('user name')).toBe(false);
      expect(isValidUsername('user-name')).toBe(false);
      expect(isValidUsername('user#123')).toBe(false);
    });

    it('accepts usernames at boundary lengths', () => {
      expect(isValidUsername('abc')).toBe(true); // 3 chars (minimum)
      expect(isValidUsername('a'.repeat(20))).toBe(true); // 20 chars (maximum)
    });
  });

  describe('USERNAME_REGEX', () => {
    it('matches valid username patterns', () => {
      expect(USERNAME_REGEX.test('valid_user.123')).toBe(true);
    });

    it('rejects invalid characters', () => {
      expect(USERNAME_REGEX.test('invalid-user')).toBe(false);
      expect(USERNAME_REGEX.test('invalid@user')).toBe(false);
    });
  });
});
