const mysql = require('mysql');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sava2005',
    database: 'learning_platform',
});

module.exports = db;