const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint za dodavanje ocene
router.post('/', (req, res) => {
    const { korisnik_id, kurs_id, ocena } = req.body;

    if (!korisnik_id || !kurs_id || !ocena) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Proveri da li je korisnik kupio kurs
    db.query(
        'SELECT * FROM kupovina WHERE korisnik_id = ? AND kurs_id = ?',
        [korisnik_id, kurs_id],
        (error, kupovinaResults) => {
            if (error) {
                console.error('Error checking purchase:', error);
                return res.status(500).json({ error: 'Error checking purchase' });
            }

            if (kupovinaResults.length === 0) {
                return res.status(403).json({ error: 'User must purchase the course before rating' });
            }

            // Proveri da li je korisnik već ocenio kurs
            db.query(
                'SELECT * FROM ratings WHERE korisnik_id = ? AND kurs_id = ?',
                [korisnik_id, kurs_id],
                (error, existingRatingResults) => {
                    if (error) {
                        console.error('Error checking existing rating:', error);
                        return res.status(500).json({ error: 'Error checking existing rating' });
                    }

                    if (existingRatingResults.length > 0) {
                        // Ažuriraj postojeću ocenu
                        db.query(
                            'UPDATE ratings SET ocena = ? WHERE korisnik_id = ? AND kurs_id = ?',
                            [ocena, korisnik_id, kurs_id],
                            (error) => {
                                if (error) {
                                    console.error('Error updating rating:', error);
                                    return res.status(500).json({ error: 'Error updating rating' });
                                }
                                return res.status(200).json({ message: 'Rating updated successfully' });
                            }
                        );
                    } else {
                        // Dodaj novu ocenu
                        db.query(
                            'INSERT INTO ratings (korisnik_id, kurs_id, ocena) VALUES (?, ?, ?)',
                            [korisnik_id, kurs_id, ocena],
                            (error) => {
                                if (error) {
                                    console.error('Error adding rating:', error);
                                    return res.status(500).json({ error: 'Error adding rating' });
                                }
                                res.status(201).json({ message: 'Rating added successfully' });
                            }
                        );
                    }
                }
            );
        }
    );
});

// Endpoint za dobijanje prosečne ocene
router.get('/average/:kurs_id', (req, res) => {
    const kursId = req.params.kurs_id;

    db.query(
        'SELECT AVG(ocena) AS averageRating FROM ratings WHERE kurs_id = ?',
        [kursId],
        (error, results) => {
            if (error) {
                console.error('Error fetching average rating:', error);
                return res.status(500).json({ error: 'Error fetching average rating' });
            }

            const averageRating = results[0] && results[0].averageRating ? parseFloat(results[0].averageRating) : 0;
            res.json({ averageRating });
        }
    );
});

// Endpoint za dobijanje ocene korisnika za kurs
router.get('/user/:korisnik_id/course/:kurs_id', (req, res) => {
    const { korisnik_id, kurs_id } = req.params;

    if (!korisnik_id || !kurs_id) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    db.query(
        'SELECT ocena FROM ratings WHERE korisnik_id = ? AND kurs_id = ?',
        [korisnik_id, kurs_id],
        (error, results) => {
            if (error) {
                console.error('Error fetching user rating:', error);
                return res.status(500).json({ error: 'Error fetching user rating' });
            }

            if (results.length > 0) {
                res.status(200).json({ ocena: results[0].ocena });
            } else {
                res.status(404).json({ error: 'Rating not found' });
            }
        }
    );
});

module.exports = router;
