const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
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
    pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            var post = results[0];
            res.send(`
            <!DOCTYPE html>
            <html lang="ko">
            
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
        body {
            background-color: hsl(259, 99%, 57%, 0.4);

        }

        h1 {
            text-align: center;
        }

        .center {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 70vh;
            flex-direction: column;
        }

        input[type="text"],
        textarea {
            width: 400px;
            padding: 12px 20px;
            margin: 8px 0;
            box-sizing: border-box;
            border: none;
            background-color: #f8f8f8;
            font-size: 16px;
        }


        input[type="text"] {
            height: 50px;
            /* input 박스의 높이를 조절합니다. */
        }

        textarea {
            display: inline;
            height: 300px;
            resize: none;
            /* textarea의 높이를 조절합니다. */
        }

        input[type="submit"] {
            display: block;
            margin: 8px auto;
        }
    </style>
                <title>${post.title} 수정</title>
            </head>
            
            <body>
            <h1>${post.title} 글 수정</h1>
                <div class="center">
                    <form action="/board/edit/${post.id}" method="post">
                        <input type="text" id="title" name="title" value="${post.title}" required>
                        <br>
                        <textarea id="content" name="content" rows="10" required>${post.content}</textarea>
                        <input type="submit" value="수정">
                    </form>
    </div>
            </body>
            
            </html>
            `);
        } else {
            res.send('Post not found');
        }
    });
});

router.post('/:id', function (req, res) {
    pool.query('UPDATE posts SET title = ?, content = ?, created_at = NOW() WHERE id = ?', [req.body.title, req.body.content, req.params.id], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/board/' + req.params.id);
    });
});


module.exports = router;
