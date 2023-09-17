// db.js
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'student_db'
});

module.exports = pool;