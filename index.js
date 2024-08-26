const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici'); 
const kurseviRouter = require('./routes/kursevi');



const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});



// Routes
app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter);
app.use('/api/kursevi', kurseviRouter);


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
