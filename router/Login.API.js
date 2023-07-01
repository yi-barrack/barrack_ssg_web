const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'user_db'
});

router.get('/', function (req, res) {
    if (req.session.userLoggedIn) {
        res.sendFile(path.join(__dirname, '../public/login_index.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

router.post('/', (req, res) => {
    var id = req.body.id;
    var psw = req.body.psw;

    // post된 id와 비번을 찾기 위해 데이터베이스 쿼리
    pool.query('SELECT * FROM users WHERE id = ? AND password = ?', [id, psw], function (error, results, fields) {
        if (error) throw error;

        // 사용자가 발견되면 로그인합니다
        if (results.length > 0) {
            req.session.userLoggedIn = true;
            req.session.save(function (err) {
                // 세션 저장이 완료되면 리다이렉트를 수행합니다.
                res.redirect('/');
            });
        }
        else {
            res.send('<p>잘못된 id 또는 비밀번호</p>');
        }
    });
});

module.exports = router;
