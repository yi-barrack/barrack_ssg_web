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


// 미들웨어 기능(작성자만 접속 가능하도록)
router.use('/:id', function(req,res,next) {
    pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id], function(error, results, fields) {
        if (error) throw error;
        if (results.length>0){
            var post = results[0];
            if (req.session.username === post.author) {
                next();
            } else {
                res.status(403).send("권한이 없습니다");
            }
        } else {
            res.status(404).send('게시물 없음');
        }
    });
});

router.get('/:id', function (req, res) {
    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Delete Post</title>
        </head>
        <body>
            <h1>Delete Post</h1>
            <p>정말 삭제하시겠습니까?</p>
            <form action="/board/delete/${req.params.id}" method="POST">
                <input type="submit" value="삭제">
                <button type="button" onclick="window.location.href='/board/${req.params.id}'">취소</button>
            </form> 
        </body>
        </html>
    `);
});

router.post('/:id', function (req, res) {
    pool.query('DELETE FROM posts WHERE id = ?', [req.params.id], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/');
    });
});


module.exports = router;
