const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding location caching columns to User table...');

db.serialize(() => {
    // Add lastKnownLat column
    db.run(`ALTER TABLE User ADD COLUMN lastKnownLat REAL`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding lastKnownLat:', err.message);
        } else {
            console.log('✓ lastKnownLat column added');
        }
    });

    // Add lastKnownLng column
    db.run(`ALTER TABLE User ADD COLUMN lastKnownLng REAL`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding lastKnownLng:', err.message);
        } else {
            console.log('✓ lastKnownLng column added');
        }
    });

    // Add lastLocationUpdate column
    db.run(`ALTER TABLE User ADD COLUMN lastLocationUpdate TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding lastLocationUpdate:', err.message);
        } else {
            console.log('✓ lastLocationUpdate column added');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('\n✓ Migration complete! Location caching columns added.');
    }
});
