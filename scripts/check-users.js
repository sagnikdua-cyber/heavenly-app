const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking users in database...\n');

db.all("SELECT id, email, name FROM User", [], (err, rows) => {
    if (err) {
        console.error('Error:', err.message);
        return;
    }

    if (rows.length === 0) {
        console.log('❌ No users found in database!');
        console.log('\nTo create a new account:');
        console.log('1. Go to http://localhost:3000/login');
        console.log('2. Enter any email and password');
        console.log('3. It will auto-create an account for you');
    } else {
        console.log(`✅ Found ${rows.length} user(s):\n`);
        rows.forEach((row, index) => {
            console.log(`${index + 1}. Email: ${row.email}`);
            console.log(`   Name: ${row.name}`);
            console.log(`   ID: ${row.id}\n`);
        });

        console.log('To login:');
        console.log('- Use one of the emails above');
        console.log('- Use the SAME password you used when you first created the account');
    }

    db.close();
});
