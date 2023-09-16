const { log } = require('console');
const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('./db.js');


router.get('/', function (req, res) {
    if (req.session.userLoggedIn) {
        res.sendFile(path.join(__dirname, '../for_users/login_index.html'));
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
            req.session.regenerate(function (err) {
                console.log(id + "  login success")
                req.session.userLoggedIn = true;
                req.session.username = id;
                req.session.save(function (err) {
                    // 세션 저장이 완료되면 리다이렉트를 수행합니다.
                    res.redirect('/for_users/login_index.html');
                });
            });
        }
        else {
            res.send("<script>alert('id 또는 비밀번호가 틀렸습니다');window.location.href='/';</script>");
        }
    });
});


module.exports = router;
