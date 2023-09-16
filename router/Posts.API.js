const express = require('express');
const router = express.Router();
const pool = require('./db.js');


router.get('/', function (req, res) {
    pool.query('SELECT * FROM posts', function (error, results, fields) {
        if (error) {
            console.log(error);
            res.status(500).send('데이터 베이스 접근 오류');
        } else {
            res.json(results);
        }
    });
});


module.exports = router;