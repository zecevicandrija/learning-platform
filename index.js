const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const db = require('./db');
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici'); 
const kurseviRouter = require('./routes/kursevi');
const lekcijeRouter = require('./routes/lekcije');

const app = express();
const port = process.env.PORT || 5000;

// Cloudinary konfiguracija
cloudinary.config({
  cloud_name: 'dovqpbkx7',
  api_key: '118693182487561',
  api_secret: 'tKno-wTaktb9giOj5Qb2ibl5qvI',
  api_environment_variable: 'CLOUDINARY_URL=cloudinary://118693182487561:tKno-wTaktb9giOj5Qb2ibl5qvI@dovqpbkx7'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ storage: multer.memoryStorage() });

// Database connection
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter);
app.use('/api/kursevi', kurseviRouter);
app.use('/api/lekcije', lekcijeRouter);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
