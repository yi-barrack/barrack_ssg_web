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

// 새로운 라우트 추가
router.get('/', function (req, res) {
    pool.query('SELECT * FROM posts', function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send('데이터 베이스 접근 오류');
        } else {
            res.json(results);
        }
    });
});


module.exports = router;