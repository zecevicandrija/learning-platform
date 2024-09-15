const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

// Endpoint to fetch all comments for a course
router.get('/kurs/:kursId', (req, res) => {
  const kursId = req.params.kursId;
  const query = `
    SELECT k.komentar, k.created_at, k.rating, u.ime, u.prezime 
    FROM komentari k 
    JOIN korisnici u ON k.korisnik_id = u.id 
    WHERE k.kurs_id = ?
    ORDER BY k.created_at DESC
  `;
  db.query(query, [kursId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
});

// Endpoint to add a new comment
router.post('/', (req, res) => {
  const { korisnik_id, kurs_id, komentar, rating } = req.body;

  if (!komentar || !korisnik_id || !kurs_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO komentari (kurs_id, korisnik_id, komentar, rating) VALUES (?, ?, ?, ?)';
  db.query(query, [kurs_id, korisnik_id, komentar, rating], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Comment added successfully', id: result.insertId });
  });
});

module.exports = router;
