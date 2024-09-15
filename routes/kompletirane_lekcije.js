const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint za dobavljanje završenih lekcija po korisniku
router.get('/korisnik/:korisnikId', (req, res) => {
    const korisnikId = req.params.korisnikId;
    const query = 'SELECT * FROM kompletirane_lekcije WHERE korisnik_id = ?';
    db.query(query, [korisnikId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje nove završenog lekcije
router.post('/', (req, res) => {
    const { korisnik_id, kurs_id, lekcija_id } = req.body;

    if (!korisnik_id || !kurs_id || !lekcija_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO kompletirane_lekcije (korisnik_id, kurs_id, lekcija_id) VALUES (?, ?, ?)';
    db.query(query, [korisnik_id, kurs_id, lekcija_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Lekcija uspešno dodata', kompletiranaLekcijaId: results.insertId });
    });
});

// Endpoint za brisanje završenih lekcija po ID-u
router.delete('/:id', (req, res) => {
    const kompletiranaLekcijaId = req.params.id;
    const query = 'DELETE FROM kompletirane_lekcije WHERE id = ?';
    db.query(query, [kompletiranaLekcijaId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Kompletirana lekcija sa ID-jem ${kompletiranaLekcijaId} uspešno obrisana` });
    });
});

// Endpoint za dobavljanje završenih lekcija po korisniku i kursu
router.get('/user/:korisnikId/course/:kursId', (req, res) => {
    const { korisnikId, kursId } = req.params;
    const query = 'SELECT * FROM kompletirane_lekcije WHERE korisnik_id = ? AND kurs_id = ?';
    db.query(query, [korisnikId, kursId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});


module.exports = router;
