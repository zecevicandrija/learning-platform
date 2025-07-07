const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const query = 'SELECT * FROM popusti';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});
// Endpoint for applying a discount code
router.post('/apply', (req, res) => {
    const { code } = req.body;

    const query = 'SELECT procenat FROM popusti WHERE kod = ?';
    db.query(query, [code], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ valid: false });
        }
        res.status(200).json({ valid: true, discountPercent: results[0].procenat });
    });
});

// Endpoint for creating a discount code
router.post('/create', (req, res) => {
    const { code, discountPercent } = req.body;

    if (!code || discountPercent === undefined) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const query = 'INSERT INTO popusti (kod, procenat) VALUES (?, ?)';
    db.query(query, [code, discountPercent], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ success: false, message: 'Error creating discount' });
        }

        res.status(201).json({ success: true });
    });
});

// Endpoint for validating a discount code
router.post('/validate', (req, res) => {
    const { code } = req.body;
  
    db.query('SELECT * FROM popusti WHERE kod = ?', [code], (error, results) => {
        if (error) {
            console.error('Error validating discount code:', error);
            return res.status(500).send('Internal server error');
        }
        
        if (results.length > 0) {
            const discount = results[0];
            res.json({
                valid: true,
                discountPercent: discount.procenat,
            });
        } else {
            res.json({
                valid: false,
                discountPercent: 0,
            });
        }
    });
});

module.exports = router;
