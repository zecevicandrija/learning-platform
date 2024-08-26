const express = require('express');
const router = express.Router();
const db = require('../db'); // Uveri se da je putanja tačna i da `db` sadrži konekciju sa bazom

// Endpoint za dobavljanje svih kurseva
router.get('/', (req, res) => {
    const query = 'SELECT * FROM kursevi'; // Pretpostavlja se da tabela u bazi ima naziv 'kursevi'
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje novog kursa
router.post('/', (req, res) => {
    const { naziv, opis, instruktor_id } = req.body;
    console.log("Received data:", req.body); // Provera da li su sva polja primljena
    try {
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
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint za ažuriranje kursa
router.put('/:id', (req, res) => {
    const courseId = req.params.id;
    const { naziv, opis, instruktor_id } = req.body;

    try {
        // Priprema SQL upita
        const query = 'UPDATE kursevi SET naziv = ?, opis = ?, instruktor_id = ? WHERE id = ?';
        const queryParams = [naziv, opis, instruktor_id, courseId];

        // Izvršavanje SQL upita
        db.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: `Course with ID ${courseId} updated successfully` });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint za brisanje kursa
router.delete('/:id', (req, res) => {
    const courseId = req.params.id;
    const query = 'DELETE FROM kursevi WHERE id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Course with ID ${courseId} deleted successfully` });
    });
});

module.exports = router;
