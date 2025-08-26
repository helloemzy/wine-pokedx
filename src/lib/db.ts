import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'wine_pokedex',
  user: process.env.DATABASE_USER || 'wine_pokedex_app',
  password: process.env.DATABASE_PASSWORD,
  max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '2000'),
  // Enable SSL in production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Database connection wrapper with error handling
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Transaction wrapper
export async function transaction<T>(
  callback: (client: { query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health_check');
    return result.rows[0]?.health_check === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
}

// Export pool for advanced usage
export { pool };

// Default db export (same as query function for compatibility)
export const db = { query, transaction, healthCheck };

// Database utility functions
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Pagination helper
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}


export function buildPaginationQuery(
  baseQuery: string,
  params: PaginationParams = {},
  defaultSortBy: string = 'id'
): { query: string; countQuery: string; limit: number; offset: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;
  const sortBy = params.sortBy || defaultSortBy;
  const sortOrder = params.sortOrder || 'ASC';

  const query = `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;
  const countQuery = baseQuery.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');

  return { query, countQuery, limit, offset };
}