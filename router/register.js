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
    // id가 중복되는지 검사
    pool.query('SELECT * FROM users WHERE id = ?', [id], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            // 중복 아이디 이면
            res.send('<script>alert("중복된 아이디입니다!");window.location.href="/";</script>')
        } else {
            // 아이디가 중복되지 않으면
            pool.query('INSERT INTO users (id, password) VALUES (?, ?)', [id, psw], function (error, results, fields) {
                if (error) throw error;
                // 홈페이지로 돌려보내기.
                res.redirect('/');
            });
        }
    });
});

module.exports = router;
