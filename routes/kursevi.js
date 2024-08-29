const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct and that `db` contains the database connection
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

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
router.post('/', upload.single('slika'), (req, res) => {
    const { naziv, opis, instruktor_id } = req.body;

    if (!naziv || !opis || !instruktor_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upload slike na Cloudinary
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
            console.error('Cloudinary error:', error);
            return res.status(500).json({ error: 'Error uploading image' });
        }

        const slikaUrl = result.secure_url;

        const query = 'INSERT INTO kursevi (naziv, opis, instruktor_id, slika) VALUES (?, ?, ?, ?)';
        db.query(query, [naziv, opis, instruktor_id, slikaUrl], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Course added successfully', courseId: results.insertId });
        });
    }).end(req.file.buffer);
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
