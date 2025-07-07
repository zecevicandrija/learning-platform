const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint to fetch purchased courses for a user
router.get('/user/:korisnikId', (req, res) => {
    const korisnikId = req.params.korisnikId;
    const query = `
        SELECT k.* FROM kursevi k
        INNER JOIN kupovina p ON k.id = p.kurs_id
        WHERE p.korisnik_id = ?
    `;
    db.query(query, [korisnikId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

/// Endpoint za dodavanje kupovine
router.post('/', async (req, res) => {
    const { korisnik_id, kurs_id, popust } = req.body;
  
    try {
      // Unesite podatke u bazu
      const query = 'INSERT INTO kupovina (korisnik_id, kurs_id, popust_id) VALUES (?, ?, ?)';
      const result = await db.query(query, [korisnik_id, kurs_id, popust]);
  
      res.status(201).json({ success: true, message: 'Purchase recorded successfully' });
    } catch (error) {
      console.error('Error recording purchase:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Endpoint to get the number of purchases for each course
router.get('/popularity', (req, res) => {
    const query = `
        SELECT k.id AS kurs_id, k.naziv AS kurs_naziv, k.cena AS kurs_cena, COUNT(p.kurs_id) AS broj_kupovina
        FROM kursevi k
        LEFT JOIN kupovina p ON k.id = p.kurs_id
        GROUP BY k.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to get students who purchased a specific course
router.get('/studenti/:kursId', (req, res) => {
    const kursId = req.params.kursId;
    const query = `
        SELECT k.id AS student_id, k.ime, k.prezime, k.email, p.datum_kupovine
        FROM korisnici k
        INNER JOIN kupovina p ON k.id = p.korisnik_id
        WHERE p.kurs_id = ?
    `;
    db.query(query, [kursId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to get revenue grouped by date
router.get('/zarada-po-danu', (req, res) => {
    const query = `
        SELECT DATE(p.datum_kupovine) AS dan, SUM(k.cena * (1 - IFNULL(p2.procenat / 100, 0))) AS dnevna_zarada
        FROM kupovina p
        INNER JOIN kursevi k ON p.kurs_id = k.id
        LEFT JOIN popusti p2 ON p.popust_id = p2.id
        GROUP BY DATE(p.datum_kupovine)
        ORDER BY dan ASC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});



module.exports = router;