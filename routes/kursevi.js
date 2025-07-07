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
    const { naziv, opis, o_cemu, instruktor_id, cena } = req.body;

    if (!naziv || !opis || !o_cemu || !instruktor_id || cena === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
            console.error('Cloudinary error:', error);
            return res.status(500).json({ error: 'Error uploading image' });
        }

        const slikaUrl = result.secure_url;

        const query = 'INSERT INTO kursevi (naziv, opis, o_cemu, instruktor_id, cena, slika) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [naziv, opis, o_cemu, instruktor_id, cena, slikaUrl], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Course added successfully', courseId: results.insertId });
        });
    }).end(req.file.buffer);
});

// Endpoint for updating a course by ID


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

// Endpoint za dobavljanje kurseva prema ID-u instruktora
router.get('/instruktor/:id', (req, res) => {
    const instructorId = req.params.id;
    const query = 'SELECT * FROM kursevi WHERE instruktor_id = ?';
    db.query(query, [instructorId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za ažuriranje kursa
// Endpoint for updating a course by ID with optional image
router.put('/:id', upload.single('slika'), (req, res) => {
    const courseId = req.params.id;
    const { naziv, opis, cena, instruktor_id } = req.body;
    
    // Check if at least one field is being updated
    if (!naziv && !opis && !cena && !instruktor_id && !req.file) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    const updateFields = {};
    if (naziv) updateFields.naziv = naziv;
    if (opis) updateFields.opis = opis;
    if (cena) updateFields.cena = cena;
    if (instruktor_id) updateFields.instruktor_id = instruktor_id;

    // If an image is uploaded, handle the Cloudinary upload
    const handleCloudinaryUpload = () => {
        return new Promise((resolve, reject) => {
            if (!req.file) return resolve(null);  // No file to upload

            cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) {
                    return reject(new Error('Error uploading image'));
                }
                resolve(result.secure_url);  // Return the uploaded image URL
            }).end(req.file.buffer);
        });
    };

    // Handle Cloudinary upload (if there's an image), then update the course
    handleCloudinaryUpload()
        .then((imageUrl) => {
            if (imageUrl) {
                updateFields.slika = imageUrl;  // Add the image URL to the update fields
            }

            // Generate dynamic SQL for updating the course
            const query = 'UPDATE kursevi SET ' +
                Object.keys(updateFields).map((key) => `${key} = ?`).join(', ') +
                ' WHERE id = ?';
            const values = [...Object.values(updateFields), courseId];

            // Execute the SQL update query
            db.query(query, values, (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ error: 'Course not found' });
                }
                res.status(200).json({ message: 'Course updated successfully' });
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error updating course' });
        });
});



module.exports = router;
