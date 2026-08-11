import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import logger from '../logger';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'app.db');
    
    logger.info(`Opening database at ${dbPath}`);
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Initialize schema
    initializeSchema(db);
  }
  
  return db;
}

function initializeSchema(database: Database.Database): void {
  // Queue table
  database.exec(`
    CREATE TABLE IF NOT EXISTS queue_tasks (
      id TEXT PRIMARY KEY,
      input_path TEXT NOT NULL,
      output_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      progress REAL DEFAULT 0,
      encoder_mode TEXT NOT NULL DEFAULT 'auto',
      error_message TEXT,
      created_at INTEGER NOT NULL,
      started_at INTEGER,
      finished_at INTEGER,
      retry_count INTEGER DEFAULT 0,
      applied_params TEXT
    )
  `);

  // Settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // License cache table
  database.exec(`
    CREATE TABLE IF NOT EXISTS license_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT NOT NULL,
      signed_token TEXT,
      hwid TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // Presets table
  database.exec(`
    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      effects_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_queue_created ON queue_tasks(created_at);
    CREATE INDEX IF NOT EXISTS idx_license_expires ON license_cache(expires_at);
  `);

  logger.info('Database schema initialized');
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database closed');
  }
}

export default getDatabase;
