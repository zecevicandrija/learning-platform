const express = require('express');
const router = express.Router();
const db = require('../db'); // Pretpostavimo da imamo db modul za konekciju sa bazom
const bcrypt = require('bcrypt');

// Endpoint za registraciju korisnika
router.post('/register', async (req, res) => {
    const { ime, prezime, email, sifra, uloga } = req.body;

    try {
        if (!ime || !prezime || !email || !sifra || !uloga) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const hashedPassword = await bcrypt.hash(sifra, 10);
        console.log('Hashed password:', hashedPassword);

        const query = "INSERT INTO korisnici (ime, prezime, email, sifra, uloga) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [ime, prezime, email, hashedPassword, uloga], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, sifra } = req.body;
    console.log(`Received login request for email: ${email}`);

    const query = 'SELECT * FROM korisnici WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];
            console.log('User found:', user);
            const match = await bcrypt.compare(sifra, user.sifra);
            if (match) {
                console.log('Password match');
                res.status(200).json({ user });
            } else {
                console.log('Invalid credentials: incorrect password');
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            console.log('Invalid credentials: user not found');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});


module.exports = router;