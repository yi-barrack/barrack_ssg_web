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

router.post('/', function (req, res) {
    // post로 온 데이터들을 변수로 지정
    var content = req.body.content;
    var author = req.session.username;
    var postId = req.body.postId;

    // 데이터베이스에 저장하기 위한 쿼리
    pool.query('INSERT INTO comments (post_id, content, author) VALUES (?, ?, ?)', [postId, content, author], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/board/' + postId);
    });
});

// 댓글 삭제
router.get('/delete/:id', function (req, res) {
    var commentId = req.params.id;
    pool.query('SELECT * FROM comments WHERE id = ?', [commentId], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            var comment = results[0];
            if (comment.author === req.session.username) {
                pool.query('DELETE FROM comments WHERE id = ?', [commentId], function (error, results, fields) {
                    if (error) throw error;
                    res.redirect('back');
                });
            } else {
                res.send("권한 없음");
            }

        } else {
            res.send('댓글이 존재하지 않습니다.');
        }
    })
})


module.exports = router;