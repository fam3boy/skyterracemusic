import { sql } from '@vercel/postgres';

// Custom error type for DB operations
export class DbError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DbError';
  }
}

// Helper to execute raw queries
export async function query(text: string, params: any[] = []) {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw new DbError('Failed to execute query', error);
  }
}

// Re-implementing simplified select/insert/update logic if needed
// but for Vercel Postgres, raw SQL via `sql` is often best.
