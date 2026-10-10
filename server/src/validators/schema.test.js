import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSnippetSchema, updateSnippetSchema } from './snippet.schema.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema.js';

describe('Validation Schemas', () => {
  describe('createSnippetSchema', () => {
    test('passes on valid snippet payload', () => {
      const payload = {
        title: 'Binary Search',
        content: 'function bs() {}',
        language: 'javascript',
        tags: ['algorithm', 'search'],
        summary: 'A fast search algorithm.'
      };
      const result = createSnippetSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    test('fails on empty title or content', () => {
      const invalid = { title: '', content: '', language: 'javascript' };
      const result = createSnippetSchema.safeParse(invalid);
      assert.equal(result.success, false);
    });
  });

  describe('auth schemas', () => {
    test('registerSchema requires valid email and min 8 char password', () => {
      const valid = { name: 'Alice', email: 'alice@example.com', password: 'password123' };
      assert.equal(registerSchema.safeParse(valid).success, true);

      const invalidEmail = { name: 'Alice', email: 'not-an-email', password: 'password123' };
      assert.equal(registerSchema.safeParse(invalidEmail).success, false);

      const shortPassword = { name: 'Alice', email: 'alice@example.com', password: '123' };
      assert.equal(registerSchema.safeParse(shortPassword).success, false);
    });

    test('loginSchema validates email and password presence', () => {
      assert.equal(loginSchema.safeParse({ email: 'alice@example.com', password: 'p' }).success, true);
      assert.equal(loginSchema.safeParse({ email: 'bad-email', password: 'p' }).success, false);
    });

    test('forgotPasswordSchema validates email format', () => {
      assert.equal(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success, true);
      assert.equal(forgotPasswordSchema.safeParse({ email: 'invalid' }).success, false);
    });

    test('resetPasswordSchema requires at least 8 chars', () => {
      assert.equal(resetPasswordSchema.safeParse({ password: 'validPass123' }).success, true);
      assert.equal(resetPasswordSchema.safeParse({ password: 'short' }).success, false);
    });
  });
});
