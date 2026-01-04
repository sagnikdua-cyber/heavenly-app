import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import fs from "fs";

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

    // Ensure directory exists with fallback to /tmp on failure
    const dbDir = path.dirname(dbPath);

    // Safety check: if /data exists but we can't write, try /tmp
    try {
        if (!fs.existsSync(dbDir)) {
            console.log('[DB] Creating database directory:', dbDir);
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Test write permissions
        const testFile = path.join(dbDir, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('[DB] Directory is writable:', dbDir);
    } catch (error) {
        console.error('[DB] Primary directory failed:', error);

        // FALLBACK: Use ephemeral /tmp storage if /data fails
        // Note: Data will be lost on restart, but better than crashing
        const fallbackPath = '/tmp/heavenly_dev.db';
        console.warn('[DB] Switching to fallback database at:', fallbackPath);
        return await open({
            filename: fallbackPath,
            driver: sqlite3.Database
        }).then(async (fallbackDb) => {
            // Run migration on fallback DB immediately
            await migrateDb(fallbackDb);
            return fallbackDb;
        });
    }

    console.log('[DB] Opening database at:', dbPath);

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await migrateDb(db);
    return db;
}

async function migrateDb(db: Database) {
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
}
