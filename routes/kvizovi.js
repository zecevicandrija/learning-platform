const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint for getting all quizzes
router.get('/', (req, res) => {
    const query = 'SELECT * FROM kvizovi';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint for getting quizzes by lesson ID
router.get('/lesson/:lessonId', (req, res) => {
    const { lessonId } = req.params;
    const query = 'SELECT * FROM kvizovi WHERE lesson_id = ?';
    db.query(query, [lessonId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        // Format results as an object with `pitanja` key
        res.status(200).json({ pitanja: results });
    });
});

// Endpoint for adding a new quiz
router.post('/', (req, res) => {
    console.log('Received data:', req.body);
    const { lesson_id, question, answers, correct_answer } = req.body;

    if (!lesson_id || !question || !answers || !correct_answer) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO kvizovi (lesson_id, question, answers, correct_answer) VALUES (?, ?, ?, ?)';
    db.query(query, [lesson_id, question, JSON.stringify(answers), correct_answer], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Quiz added successfully', quizId: results.insertId });
    });
});



// Endpoint for updating an existing quiz
router.put('/:id', (req, res) => {
    const quizId = req.params.id;
    const { lesson_id, question, answers, correct_answer } = req.body;

    if (!lesson_id || !question || !answers || !correct_answer) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'UPDATE kvizovi SET lesson_id = ?, question = ?, answers = ?, correct_answer = ? WHERE id = ?';
    db.query(query, [lesson_id, question, JSON.stringify(answers), correct_answer, quizId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Quiz with ID ${quizId} updated successfully` });
    });
});

// Endpoint for deleting a quiz
router.delete('/:id', (req, res) => {
    const quizId = req.params.id;
    const query = 'DELETE FROM kvizovi WHERE id = ?';
    db.query(query, [quizId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Quiz with ID ${quizId} deleted successfully` });
    });
});

module.exports = router;
