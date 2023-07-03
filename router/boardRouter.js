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



router.get('/new', function (req, res) {
    res.sendFile(path.join(__dirname, '../for_users/create.html'));
});

// 데이터베이스 고유의 id로 접근 가능
router.get('/:id', function (req, res) {
    var postId = req.params.id;
    pool.query('SELECT * FROM posts WHERE id = ?', [postId], function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send('데이터 베이스 접근 오류');
        } else {
            if (results.length > 0) {
                var post = results[0];
                // 수정 버튼 추가
                // 새로운 페이지에서 제목, 내용, 작성자를 테이블 형태로 보여줍니다.
                var postPage = '<style>\
                table { border - collapse: collapse; } th, td { border: 1px solid black; padding: 8px; width: 300px;}\
                #detail {height : 300px}\
                </style > ';
                if (req.session.username === post.author) {
                    postPage += '<button onclick="location.href=\'/board/edit/' + postId + '\'">수정</button>';
                }
                postPage += '<table>';
                postPage += '<tr><th>제목</th><td>' + post.title + '</td><th>작성자</th><td>' + post.author + '</td></tr>';
                postPage += '<tr><th id = "detail">내용</th><td colspan="3" id = "detail">' + post.content + '</td></tr>';
                postPage += '</table>';
                res.send(postPage);

            } else {
                res.status(404).send('게시물 없음');
            }
        }
    });
});



router.post('/new', function (req, res) {
    // post로 온 데이터들을 변수로 지정
    var title = req.body.title;
    var content = req.body.content;
    var author = req.session.username;

    // 데이터베이스에 저장하기 위한 쿼리
    pool.query('INSERT INTO posts (title, content, author) VALUES (?, ?, ?)', [title, content, author], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/'); // 게시글 작성 후 메인 페이지로 리다이렉트
    });
});

module.exports = router;
