const express = require('express');
const router = express.Router();
const path = require('path');
const xssFilters = require('xss-filters');
const pool = require('./students_db.js');


router.get('/', function (req, res) {
    pool.query('SELECT * FROM students', function (err, results) {
        if (err) {
            console.log(err);
            return;
        }

        let html = `
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
        `;

        console.log(results);


        results.forEach(result => {
            html += `
                <tr>
                    <td>${result.student_name}</td>
                    <td>${result.student_time}</td>
                    <td>${result.attendant}</td>
                </tr>
            `
        });

        html += `</table></body></html>`;
        res.send(html);
    });
});




module.exports = router;