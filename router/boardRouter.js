const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const editRouter = require('./edit.API');
const deleteRouter = require('./delete.API');
const commentRouter = require('./commentRouter');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'user_db'
});

router.use('/delete', deleteRouter);
router.use('/edit', editRouter);
router.use('/comment', commentRouter);

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
                table { border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; width: 300px;}\
                #detail {height : 300px}\
                strong { font-size: 20px; }\
                li { margin-bottom: 10px; }\
                li > strong {margin-right:20px;}\
                </style>';
                
                if (req.session.username === post.author) { //자신이 작성자일 경우에만 기능 사용 가능
                    // 수정 버튼
                    postPage += '<button onclick="location.href=\'/board/edit/' + postId + '\'">수정</button>';
                    // 삭제 버튼
                    postPage += '<button onclick="location.href=\'/board/delete/' + postId + '\'">삭제</button>';
                }
                // 홈 버튼
                postPage += '<button onclick="location.href=\'/\'">홈</button>';

                postPage += '<table>';
                postPage += '<tr><th>제목</th><td>' + post.title + '</td><th>작성자</th><td>' + post.author + '</td></tr>';
                postPage += '<tr><th id = "detail">내용</th><td colspan="3" id = "detail">' + post.content + '</td></tr>';
                postPage += '</table>';

                // 댓글 기능 구현
                pool.query('SELECT * FROM comments WHERE post_id = ?', [postId], function (error, results, fields) {
                    if (error) throw error;
                    postPage += '<h2>댓글</h2>';
                    postPage += '<ul>';
                    for (var i = 0; i < results.length; i++) {
                        var comment = results[i];
                        var date = new Date(comment.created_at);
                        var formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0') + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
                        postPage += '<li>';
                        postPage += '<strong>' + comment.author + '</strong> ';
                        postPage += formattedDate;
                        // 삭제 버튼
                        if (req.session.username === comment.author) {
                            postPage += '<button onclick="location.href=\'/board/comment/delete/' + comment.id + '\'">삭제</button>'
                        }
                        postPage += '<br>';
                        postPage += comment.content;
                        postPage += '</li>';
                    }
                    postPage += '</ul>';
                    postPage += '<hr>';
                    postPage += '<form action="./comment" method="post">';
                    postPage += '<input type="hidden" name="postId" value="' + postId + '">';
                    postPage += '<input type="text" id="content" name="content" placeholder="댓글을 입력하세요" style="height : 50px;">';
                    postPage += '</form>';
                    res.send(postPage); // 비동기라 안에 둬야 데이터베이스에서 가져온 후 작동
                })
            } else {
                res.status(404).send('게시물 없음');
            }
        }
    });
});



router.post('/new', upload.single('file'), function (req, res) {
    // post로 온 데이터들을 변수로 지정
    var title = req.body.title;
    var content = req.body.content;
    var author = req.session.username;
    var file = req.file;

    if (!file) {
        // 파일 업로드 실패
        console.log('파일 업로드 실패');
        res.redirect('/'); // 메인 페이지로 리다이렉트
        return;
    }

    // 파일 db 저장
    pool.query('INSERT INTO files (name, mimetype, size, data) VALUES (?, ?, ?, ?)', [file.originalname, file.mimetype, file.size, file.buffer], function (error, results, fields) {
        if (error) throw error;
        console.log("저장 성공");

        // 데이터베이스에 저장하기 위한 쿼리
        pool.query('INSERT INTO posts (title, content, author, created_at, file_id) VALUES (?, ?, ?, NOW(), ?)', [title, content, author, results.insertId], function (error, results, fields) {
            if (error) throw error;
            res.redirect('/'); // 게시글 작성 후 메인 페이지로 리다이렉트
        });
    });
});

module.exports = router;
