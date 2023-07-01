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
    res.sendFile(path.join(__dirname, '../for_users/create.html'));
});

router.post('/', function (req, res) {
    var title = req.body.title;
    var content = req.body.content;
    var author = req.session.username;

    // 게시글을 데이터베이스에 저장하는 쿼리를 작성해야 합니다.
    // 이 부분은 데이터베이스 구조에 따라 달라질 수 있습니다.
    pool.query('INSERT INTO posts (title, content, author) VALUES (?, ?, ?)', [title, content, author], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/'); // 게시글 작성 후 메인 페이지로 리다이렉트
    });
});

module.exports = router;
