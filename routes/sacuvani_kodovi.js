const express = require('express');
const router = express.Router();
const pool = require('../db'); // MySQL pool

// POST - čuvanje ili ažuriranje koda
router.post('/', async (req, res) => {
    const { user_id, lesson_id, code, language } = req.body;

    try {
        await pool.query(
            `INSERT INTO sacuvani_kodovi (user_id, lesson_id, code, language)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE code = VALUES(code), language = VALUES(language)`,
            [user_id, lesson_id, code, language]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving code:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// GET - dohvat sačuvanog koda
router.get('/:user_id/:lesson_id', async (req, res) => {
    const { user_id, lesson_id } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT code, language FROM sacuvani_kodovi WHERE user_id = ? AND lesson_id = ?',
            [user_id, lesson_id]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({});
        }
    } catch (err) {
        console.error('Error fetching code:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
