const express = require('express');
const router = express.Router();
const path = require('path');
const editRouter = require('./edit.API');
const deleteRouter = require('./delete.API');
const commentRouter = require('./commentRouter');
const xssFilters = require('xss-filters');

const multer = require('multer');
const pool = require('./db.js');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 파일이 저장될 디렉토리 지정
    },
    filename: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        const id = uuidv4(); // uuidv4 함수를 통해 고유한 UUID 생성. 고유한 파일 이름을 생성해서 서버에 영향 안주게 함.
        callback(null, `${id}${ext}`);
    }
})

var upload = multer({
    storage: storage,
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 1024 // 1MB
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            return cb(new Error('Only JPG, JPEG, PNG are allowed'), false);
        }
        cb(null, true);
    }
})





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
                var safeTitle = xssFilters.inHTMLData(post.title);
                var safeAuthor = xssFilters.inHTMLData(post.author);
                var safeContent = xssFilters.inHTMLData(post.content);
                postPage += '<tr><th>제목</th><td>' + safeTitle + '</td><th>작성자</th><td>' + safeAuthor + '</td></tr>';
                postPage += '<tr><th id = "detail">내용</th><td colspan="3" id = "detail">' + safeContent + '</td></tr>';
                postPage += '</table>';

                // 파일 첨부
                if (post.file_path) {
                    //파일 다운로드
                    var fileName = path.basename(post.file_path);
                    var filePath = path.join("/uploads");
                    console.log(fileName);
                    console.log(filePath);
                    postPage += '<a href="' + filePath + '" download="' + fileName + '">첨부파일 다운로드 (' + fileName + ')</a>';
                }



                // 댓글 기능 구현
                pool.query('SELECT * FROM comments WHERE post_id = ?', [postId], function (error, results, fields) {
                    if (error) throw error;
                    postPage += '<h2>댓글</h2>';
                    postPage += '<ul>';
                    for (var i = 0; i < results.length; i++) {
                        var comment = results[i];
                        var date = new Date(comment.created_at);
                        var formattedDate = date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                        postPage += '<li>';
                        safeAuthor = xssFilters.inHTMLData(comment.author);
                        postPage += '<strong>' + safeAuthor + '</strong> ';
                        postPage += formattedDate;
                        // 삭제 버튼
                        if (req.session.username === safeAuthor) {
                            postPage += '<button onclick="location.href=\'/board/comment/delete/' + comment.id + '\'">삭제</button>'
                        }
                        postPage += '<br>';
                        safeContent = xssFilters.inHTMLData(comment.content);
                        postPage += safeContent;
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

// 게시글 작성
router.post('/new', function (req, res) {
    upload.single('file')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // 파일 용량 초과
            res.status(500).send({ error: 'File upload failed.' });
        } else if (err) {
            // 파일 업로드 안하면
            res.status(500).send({ error: 'File upload failed.' });
        } else {
            // post로 온 데이터들을 변수로 지정
            var title = req.body.title;
            var content = req.body.content;
            var author = req.session.username;
            var file = req.file;

            // 사용자 입력 필터링
            var safeTitle = xssFilters.inHTMLData(title);
            var safeContent = xssFilters.inHTMLData(content);

            if (file) {
                // 데이터베이스에 저장하기 위한 쿼리
                pool.query('INSERT INTO posts (title, content, author, created_at, file_path) VALUES (?, ?, ?, NOW(), ?)', [safeTitle, safeContent, author, file.path], function (error, results, fields) {
                    if (error) throw error;
                    res.redirect('/'); // 게시글 작성 후 메인 페이지로 리다이렉트
                });
            } else {
                // 파일 업로드 안함
                pool.query('INSERT INTO posts (title, content, author, created_at) VALUES (?, ?, ?, NOW())', [safeTitle, safeContent, author], function (error, results, fields) {
                    if (error) throw error;
                    res.redirect('/'); // 게시글 작성 후 메인 페이지로 리다이렉트
                });
            }
        }
    });
});


module.exports = router;

