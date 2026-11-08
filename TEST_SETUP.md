# Test & Git Hooks Setup

## Install Dependencies

```bash
npm install -D vitest@^1.0.4 supertest@^6.3.3 husky@^8.0.3
```

## Setup Husky (Git Hooks)

```bash
npm run prepare
npx husky add .husky/pre-commit "npm run test -- --run"
chmod +x .husky/pre-commit
```

## Run Tests

```bash
# Run tests once
npm test -- --run

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Manual Test (tanpa commit)

```bash
npm test -- --run --reporter=verbose
```

## Test Coverage

Tests mencakup:
- Token generation & verification (JWT)
- Session inactivity timeout (7 hari)
- Hash functions (SHA-256)
- Refresh token rotation

## Pre-commit Hook

Setiap commit otomatis run tests. Jika test gagal, commit dibatalkan.

Bypass (darurat saja):
```bash
git commit --no-verify
```

## Migration

Jalankan migration sebelum test pertama kali:
```bash
npm run db:migrate
```

Database test pakai mock, tidak perlu DB real untuk unit tests.
