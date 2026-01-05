import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
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
  describe('registerUser', () => {
    let testEmail;
    let testUsername;
    const testPassword = 'Password123';

    beforeEach(() => {
      testEmail = `test-${Date.now()}-${Math.random()}@example.com`;
      testUsername = `testuser${Date.now()}-${Math.random()}`;
    });

    afterEach(async () => {
      // Clean up test data
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: testEmail },
            { email: { contains: testEmail.split('-')[1] } },
            { username: { contains: testUsername.split('-')[0] } },
          ],
        },
      });
    });

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
    const testEmail = `logintest-${Date.now()}@example.com`;
    const testUsername = `loginuser${Date.now()}`;
    const testPassword = 'Password123';

    beforeAll(async () => {
      await registerUser(testEmail, testUsername, testPassword);
    });

    afterAll(async () => {
      // Clean up test data for login tests
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: testEmail },
            { username: testUsername },
          ],
        },
      });
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
