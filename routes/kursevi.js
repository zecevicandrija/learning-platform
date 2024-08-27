const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct and that `db` contains the database connection

// Endpoint for fetching all courses
router.get('/', (req, res) => {
    const query = 'SELECT * FROM kursevi';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint for fetching a specific course by ID
router.get('/:id', (req, res) => {
    const courseId = req.params.id;
    const query = 'SELECT * FROM kursevi WHERE id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json(results[0]);
    });
});

// Endpoint for adding a new course
router.post('/', (req, res) => {
    const { naziv, opis, instruktor_id } = req.body;

    if (!naziv || !opis || !instruktor_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO kursevi (naziv, opis, instruktor_id) VALUES (?, ?, ?)';
    db.query(query, [naziv, opis, instruktor_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Course added successfully', courseId: results.insertId });
    });
});

// Endpoint for updating a course by ID
router.put('/:id', (req, res) => {
    const courseId = req.params.id;
    const { naziv, opis, instruktor_id } = req.body;

    if (!naziv || !opis || !instruktor_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'UPDATE kursevi SET naziv = ?, opis = ?, instruktor_id = ? WHERE id = ?';
    db.query(query, [naziv, opis, instruktor_id, courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: `Course with ID ${courseId} not found` });
        }
        res.status(200).json({ message: `Course with ID ${courseId} updated successfully` });
    });
});

// Endpoint for deleting a course by ID
router.delete('/:id', (req, res) => {
    const courseId = req.params.id;
    const query = 'DELETE FROM kursevi WHERE id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: `Course with ID ${courseId} not found` });
        }
        res.status(200).json({ message: `Course with ID ${courseId} deleted successfully` });
    });
});

module.exports = router;
