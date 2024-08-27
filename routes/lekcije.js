// src/routes/lekcije.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct and that `db` contains the database connection

// Endpoint for fetching all lessons
router.get('/', (req, res) => {
    const query = 'SELECT * FROM lekcije';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint for fetching lessons by course ID
router.get('/course/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = 'SELECT * FROM lekcije WHERE course_id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Ensure this endpoint in lekcije.js is properly handling the request
router.post('/', (req, res) => {
    const { course_id, title, content } = req.body;

    if (!course_id || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO lekcije (course_id, title, content) VALUES (?, ?, ?)';
    db.query(query, [course_id, title, content], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Lesson added successfully', lessonId: results.insertId });
    });
});


// Endpoint for updating an existing lesson
router.put('/:id', (req, res) => {
    const lessonId = req.params.id;
    const { course_id, title, content } = req.body;

    try {
        if (!course_id || !title || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const query = 'UPDATE lekcije SET course_id = ?, title = ?, content = ? WHERE id = ?';
        db.query(query, [course_id, title, content, lessonId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: `Lesson with ID ${lessonId} updated successfully` });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for deleting a lesson
router.delete('/:id', (req, res) => {
    const lessonId = req.params.id;
    const query = 'DELETE FROM lekcije WHERE id = ?';
    db.query(query, [lessonId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Lesson with ID ${lessonId} deleted successfully` });
    });
});

module.exports = router;
