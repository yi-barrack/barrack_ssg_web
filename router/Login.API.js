const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'clients_db'
});

router.post('/', (req, res) => {
    var id = req.body.id;
    var psw = req.body.psw;
    
    // 데이터베이스 연결
    connection.connect();

    // post된 id와 비번을 찾기 위해 데이터베이스 쿼리
    connection.query('SELECT * FROM users WHERE id = ? AND password = ?', [id, psw], function (error, results, fields) {
        if (error) throw error;

        // 사용자가 발견되면 로그인합니다
        if (results.length > 0) {
            res.send('<p>로그인 성공</p>');
        }
        else {
            res.send('<p>잘못된 id 또는 비밀번호</p>');
        }
    });

    // 데이터베이스 연결을 종료
    connection.end();
});




module.exports = router;