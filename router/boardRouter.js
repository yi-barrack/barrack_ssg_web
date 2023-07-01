const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'user_db'
});

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../for_users/create.html'));
});

router.post('/new', function (req, res) {
    var title = req.body.title;
    var content = req.body.content;
    var author = req.session.username;

});
    
module.exports = router;
