const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10, // 동시에 사용할 수 있는 최대 연결 수
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'user_db'
});

router.post('/', (req, res) => {
    var id = req.body.id;
    var psw = req.body.psw;

    // post된 id와 비번을 찾기 위해 데이터베이스 쿼리
    pool.query('SELECT * FROM users WHERE id = ? AND password = ?', [id, psw], function (error, results, fields) {
        if (error) throw error;

        // 사용자가 발견되면 로그인합니다
        if (results.length > 0) {
            res.send('<p>로그인 성공</p>');
        }
        else {
            res.send('<p>잘못된 id 또는 비밀번호</p>');
        }
    });
});

module.exports = router;
