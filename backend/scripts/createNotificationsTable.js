require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db');

const createTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ notifications table created (or already exists)');
    } catch (err) {
        console.error('❌ Error creating notifications table:', err);
    } finally {
        process.exit(0);
    }
};

createTable();
