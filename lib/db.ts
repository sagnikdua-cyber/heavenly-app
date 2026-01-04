import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

let db: Database | null = null;

/**
 * Get or create database connection with automatic schema migration
 */
export async function getDb(): Promise<Database> {
    if (db) return db;

    // Use absolute path to database file
    // In production (Render), use the persistent disk path '/data'
    const dbPath = process.env.NODE_ENV === 'production'
        ? '/data/dev.db'
        : path.join(process.cwd(), 'prisma', 'dev.db');

    console.log('[DB] Opening database at:', dbPath);

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    // Ensure tables exist (migration)
    try {
        // User table
        await db.exec(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        guardianEmail TEXT,
        guardianPassword TEXT,
        locationPermission INTEGER,
        notificationPermission INTEGER,
        helplineEmail TEXT,
        lastKnownLat REAL,
        lastKnownLng REAL,
        lastLocationUpdate TEXT
      );
    `);

        // UserMemories table for personalized context
        await db.exec(`
      CREATE TABLE IF NOT EXISTS UserMemories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        memory_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id)
      );
    `);

        console.log('[DB] Tables initialized successfully');

        // Try to add columns if they don't exist (for existing databases)
        const columns = await db.all("PRAGMA table_info(User)");
        const columnNames = columns.map((col: any) => col.name);

        if (!columnNames.includes('lastKnownLat')) {
            await db.exec("ALTER TABLE User ADD COLUMN lastKnownLat REAL");
            console.log('[DB] Added lastKnownLat column');
        }

        if (!columnNames.includes('lastKnownLng')) {
            await db.exec("ALTER TABLE User ADD COLUMN lastKnownLng REAL");
            console.log('[DB] Added lastKnownLng column');
        }

        if (!columnNames.includes('lastLocationUpdate')) {
            await db.exec("ALTER TABLE User ADD COLUMN lastLocationUpdate TEXT");
            console.log('[DB] Added lastLocationUpdate column');
        }
    } catch (error: any) {
        // Ignore errors if columns already exist
        if (!error.message?.includes('duplicate column') && !error.message?.includes('already exists')) {
            console.error('[DB] Migration error:', error);
        }
    }

    return db;
}
