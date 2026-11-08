// ==========================================
// TEST: Token utils
// ==========================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, generateJti, hashToken } from '../token.js';
import crypto from 'crypto';

describe('Token Utils', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-secret-access-12345';
    process.env.JWT_REFRESH_SECRET = 'test-secret-refresh-12345';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('signAccessToken creates valid JWT', () => {
    const userId = 'test-user-id';
    const token = signAccessToken(userId);

    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it('verifyAccessToken extracts userId', () => {
    const userId = 'user-123';
    const token = signAccessToken(userId);
    const extractedId = verifyAccessToken(token);

    expect(extractedId).toBe(userId);
  });

  it('signRefreshToken creates valid JWT with jti', () => {
    const userId = 'test-user-id';
    const jti = generateJti();
    const token = signRefreshToken(userId, jti);

    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it('verifyRefreshToken extracts payload', () => {
    const userId = 'user-456';
    const jti = generateJti();
    const token = signRefreshToken(userId, jti);
    const payload = verifyRefreshToken(token);

    expect(payload.sub).toBe(userId);
    expect(payload.jti).toBe(jti);
  });

  it('hashToken produces SHA-256 hash', () => {
    const token = 'test-token-123';
    const hash = hashToken(token);

    expect(hash).toBe(crypto.createHash('sha256').update(token).digest('hex'));
    expect(hash.length).toBe(64); // SHA-256 hex is 64 chars
  });

  it('generateJti produces unique random hex', () => {
    const jti1 = generateJti();
    const jti2 = generateJti();

    expect(jti1).not.toBe(jti2);
    expect(jti1.length).toBe(32); // 16 bytes = 32 hex chars
  });
});
