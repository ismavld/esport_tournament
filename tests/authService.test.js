import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { registerUser, loginUser } from '../src/services/authService.js';
import prisma from '../src/utils/prisma.js';

// Mock bcrypt for testing
vi.mock('bcrypt', () => ({
  default: {
    hash: async (password, rounds) => `hashed_${password}`,
    compare: async (password, hashedPassword) => {
      return `hashed_${password}` === hashedPassword;
    },
  },
}));

describe('Authentication Service', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testUsername = `testuser${Date.now()}`;
  const testPassword = 'Password123';

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testEmail },
          { username: testUsername },
        ],
      },
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user with mocked bcrypt', async () => {
      // Since bcrypt is mocked, we can test without native bindings
      const result = await registerUser(testEmail, testUsername, testPassword);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(testEmail);
      expect(result.user.username).toBe(testUsername);
      expect(result.user.role).toBe('PLAYER');
    });

    it('should throw error when email already exists', async () => {
      // First registration
      await registerUser(testEmail, testUsername, testPassword);

      // Try to register with same email
      await expect(
        registerUser(testEmail, `different${testUsername}`, testPassword)
      ).rejects.toThrow('Email already in use');
    });

    it('should throw error when username already exists', async () => {
      // First registration
      await registerUser(testEmail, testUsername, testPassword);

      // Try to register with same username
      await expect(
        registerUser(`different-${testEmail}`, testUsername, testPassword)
      ).rejects.toThrow('Username already in use');
    });
  });

  describe('loginUser', () => {
    beforeAll(async () => {
      await registerUser(testEmail, testUsername, testPassword);
    });

    it('should successfully login with correct credentials', async () => {
      const result = await loginUser(testEmail, testPassword);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(testEmail);
    });

    it('should throw error with incorrect email', async () => {
      await expect(
        loginUser('nonexistent@example.com', testPassword)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return a valid JWT token structure', async () => {
      const result = await loginUser(testEmail, testPassword);

      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });
});
