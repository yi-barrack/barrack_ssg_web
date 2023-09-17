const express = require('express');
const router = express.Router();
const path = require('path');
const xssFilters = require('xss-filters');
const pool = require('./students_db.js');


router.get('/', function (req, res) {
    pool.query('SELECT * FROM students', function (err, results) {
        if (err) {
            console.log(err);
        }
        res.json(results);
    }
    );
    
    res.send(`
    <!DOCTYPE html>
    <html lang="ko">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>

    <body>
    <h1>등원정보</h1>
    <table>
    <tr>
    <th>이름</th>
    <th>등원시간</th>
    <th>등원여부</th>
    </tr>
    <tr>
    <td>김민수</td>
    <td>08:30</td>
    <td>등원</td>
    </tr>
    </table>
    `
    );
});




module.exports = router;