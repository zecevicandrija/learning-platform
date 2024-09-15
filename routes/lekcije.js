const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const db = require('../db');

// Cloudinary konfiguracija
cloudinary.config({
    cloud_name: 'dovqpbkx7',
    api_key: '118693182487561',
    api_secret: 'tKNo-wTaktb9giOj5Qb2ibl5qvI'
});

// Multer konfiguracija za upload
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint za preuzimanje svih lekcija
router.get('/', (req, res) => {
    const query = 'SELECT * FROM lekcije';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za preuzimanje lekcija po ID kursa
router.get('/course/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = 'SELECT * FROM lekcije WHERE course_id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

// Endpoint za dodavanje nove lekcije
router.post('/', upload.single('video'), async (req, res) => {
    const { course_id, title, content, section } = req.body;

    if (!course_id || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let videoUrl = '';

        if (req.file) {
            // Upload video to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            videoUrl = result.secure_url;
        }

        // Insert lesson with or without video URL into the database
        const query = 'INSERT INTO lekcije (course_id, title, content, video_url, section) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [course_id, title, content, videoUrl, section], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Lesson added successfully', lessonId: results.insertId });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint za ažuriranje postojeće lekcije sa video
router.put('/:id', upload.single('video'), async (req, res) => {
    const lessonId = req.params.id;
    const { course_id, title, content, section, video_url } = req.body;

    if (!course_id || !title || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let newVideoUrl = video_url; // Use existing video URL if no new video is uploaded

        if (req.file) {
            // Upload new video to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            newVideoUrl = result.secure_url;
        }

        // Update lesson in the database
        const query = 'UPDATE lekcije SET course_id = ?, title = ?, content = ?, video_url = ?, section = ? WHERE id = ?';
        db.query(query, [course_id, title, content, newVideoUrl, section, lessonId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: `Lesson with ID ${lessonId} updated successfully` });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint za brisanje lekcije
router.delete('/:id', (req, res) => {
    const lessonId = req.params.id;
    const query = 'DELETE FROM lekcije WHERE id = ?';
    db.query(query, [lessonId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: `Lesson with ID ${lessonId} deleted successfully` });
    });
});

// Endpoint za preuzimanje unikatnih sekcija po kursu
router.get('/sections/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = 'SELECT DISTINCT section FROM lekcije WHERE course_id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results.map(row => row.section));
    });
});

// Endpoint za prikaz ukupnog broja lekcija
router.get('/count/:courseId', (req, res) => {
    const { courseId } = req.params;
    const query = 'SELECT COUNT(*) AS lessonCount FROM lekcije WHERE course_id = ?';
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ lessonCount: results[0].lessonCount });
    });
});


module.exports = router;
