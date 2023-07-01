const express = require('express');
const session = require('express-session');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'user_db'
});

router.use(session({
    secret: process.env.SESSION_KEY, // 비밀 키
    resave: false,                   // 세션에 변경사항이 있을 시에만 세션을 다시 저장
    saveUninitialized: true,        // 초기화 되지 않은 세션도 저장
    cookie: { secure: false } // for https use { secure: true }
}));

router.post('/', (req, res) => {
    var id = req.body.id;
    var psw = req.body.psw;

    pool.query('SELECT * FROM users WHERE id = ? AND password = ?', [id, psw], function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
            req.session.userLoggedIn = true;
            res.sendFile(path.join(__dirname, '../public/login_index.html'));
        }
        else {
            res.send('<p>잘못된 id 또는 비밀번호</p>');
        }
    });
});

module.exports = router;
