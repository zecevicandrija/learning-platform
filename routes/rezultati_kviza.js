const express = require('express');
const router = express.Router();
const db = require('../db');

// Route to save quiz results
router.post('/submit', (req, res) => {
    const { user_id, lesson_id, quiz_id, score, total_questions } = req.body;

    // Log incoming request data for debugging
    console.log('Incoming request data:', req.body);

    if (!user_id || !lesson_id || !quiz_id || score === undefined || !total_questions) {
        return res.status(400).json({ error: 'Nedostaju potrebni podaci' });
    }

    const query = 'INSERT INTO rezultati_kviza (user_id, lesson_id, quiz_id, score, total_questions) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [user_id, lesson_id, quiz_id, score, total_questions], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Greška u bazi podataka' });
        }
        res.status(201).json({ message: 'Rezultat kviza uspešno sačuvan', resultId: results.insertId });
    });
});

// Route to get quiz result for a specific user, lesson, and quiz
router.get('/result', (req, res) => {
    const { user_id, lesson_id, quiz_id } = req.query;

    if (!user_id || !lesson_id || !quiz_id) {
        return res.status(400).json({ error: 'Nedostaju potrebni parametri' });
    }

    const query = 'SELECT score FROM rezultati_kviza WHERE user_id = ? AND lesson_id = ? AND quiz_id = ?';

    db.query(query, [user_id, lesson_id, quiz_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Greška u bazi podataka' });
        }

        if (results.length > 0) {
            return res.status(200).json({ score: results[0].score });
        } else {
            return res.status(404).json({ message: 'Rezultat nije pronađen' });
        }
    });
});


module.exports = router;
