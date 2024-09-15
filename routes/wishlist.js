const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct and that `db` contains the database connection

// Endpoint for adding a course to the wishlist
router.post('/', (req, res) => {
    const { korisnik_id, kurs_id } = req.body;

    if (!korisnik_id || !kurs_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO wishlist (korisnik_id, kurs_id) VALUES (?, ?)';
    db.query(query, [korisnik_id, kurs_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Course added to wishlist successfully' });
    });
});

// Endpoint for fetching a user's wishlist
router.get('/:korisnik_id', (req, res) => {
    const korisnikId = req.params.korisnik_id;
    const query = `
        SELECT wishlist.kurs_id, kursevi.naziv
        FROM wishlist
        JOIN kursevi ON wishlist.kurs_id = kursevi.id
        WHERE wishlist.korisnik_id = ?
    `;
    db.query(query, [korisnikId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint for removing a course from the wishlist
router.delete('/', (req, res) => {
    const { korisnik_id, kurs_id } = req.body;

    if (!korisnik_id || !kurs_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'DELETE FROM wishlist WHERE korisnik_id = ? AND kurs_id = ?';
    db.query(query, [korisnik_id, kurs_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Course removed from wishlist successfully' });
    });
});

module.exports = router;
