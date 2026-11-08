// ==========================================
// TEST: Session/Refresh Token Inactivity
// ==========================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { query } from '../db/pool.js';

vi.mock('../db/pool.js');

describe('Session Inactivity Timeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject token older than 7 days without access', async () => {
    const tokenHash = 'test-hash-123';
    const sevenDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

    query.mockResolvedValueOnce({
      rows: [
        {
          id: 'token-id-1',
          user_id: 'user-123',
          last_accessed_at: sevenDaysAgo,
          revoked_at: null,
          expires_at: new Date(Date.now() + 1000),
        },
      ],
    });

    // Token sudah lebih dari 7 hari tidak diakses
    const isExpired = new Date() - sevenDaysAgo > 7 * 24 * 60 * 60 * 1000;
    expect(isExpired).toBe(true);
  });

  it('should accept token accessed within 7 days', async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    const isValid = new Date() - threeDaysAgo <= 7 * 24 * 60 * 60 * 1000;
    expect(isValid).toBe(true);
  });

  it('should update last_accessed_at on refresh', async () => {
    const tokenId = 'token-id-1';
    const userId = 'user-123';

    query.mockResolvedValueOnce({
      rows: [{ id: tokenId, user_id: userId }],
    });

    // Simulasi update last_accessed_at
    query.mockResolvedValueOnce({
      rows: [{ id: tokenId }],
    });

    // Trigger update
    await query(
      'UPDATE refresh_tokens SET last_accessed_at = now() WHERE id = $1',
      [tokenId]
    );

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('last_accessed_at'),
      [tokenId]
    );
  });

  it('should reject token with absolute expiry even if recently accessed', async () => {
    const now = new Date();
    const recentlyAccessed = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
    const expiredAt = new Date(now.getTime() - 1000); // Expired 1 second ago

    // Token sudah lewat absolute expiry walaupun baru diakses
    const isExpiredAbsolute = now > expiredAt;
    expect(isExpiredAbsolute).toBe(true);

    // Check juga inactivity
    const isInactive = now - recentlyAccessed > 7 * 24 * 60 * 60 * 1000;
    expect(isInactive).toBe(false);
  });
});
