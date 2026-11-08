// ==========================================
// TEST SETUP
// Setup environment variables dan mock DB untuk testing
// ==========================================

import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret-12345';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-12345';
process.env.NODE_ENV = 'test';

// Mock database pool jika tidak ada test DB
vi.mock('../db/pool.js', () => ({
  query: vi.fn(),
}));
