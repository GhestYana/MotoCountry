const db = require('../db');

module.exports.createNotification = async (userId, message) => {
    if (!userId) return null;
    const sql = `
        INSERT INTO notifications (user_id, message)
        VALUES ($1, $2)
        RETURNING *
    `;
    const result = await db.query(sql, [userId, message]);
    return result.rows[0];
};

module.exports.getUserNotifications = async (userId) => {
    const sql = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 20
    `;
    const result = await db.query(sql, [userId]);
    return result.rows;
};

module.exports.markAsRead = async (notificationId) => {
    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
        RETURNING *
    `;
    const result = await db.query(sql, [notificationId]);
    return result.rows[0];
};

module.exports.markAllAsRead = async (userId) => {
    const sql = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
    `;
    await db.query(sql, [userId]);
    return true;
};

module.exports.deleteNotification = async (notificationId, userId) => {
    const sql = `
        DELETE FROM notifications
        WHERE id = $1 AND user_id = $2
        RETURNING *
    `;
    const result = await db.query(sql, [notificationId, userId]);
    return result.rows[0];
};
