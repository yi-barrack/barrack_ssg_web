const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'user_db'
});

router.post('/', (req, res) => {
    var id = req.body.id;
    var psw = req.body.psw;

    // post된 id와 비번을 데이터베이스에 추가
    pool.query('INSERT INTO users (id, password) VALUES (?, ?)', [id, psw], function (error, results, fields) {
        if (error) throw error;

        // 사용자 등록 성공 메시지를 보냅니다
        res.send('<p>사용자 등록 성공</p>');
    });
});

module.exports = router;
