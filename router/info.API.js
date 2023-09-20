const express = require('express');
const router = express.Router();
const path = require('path');
const xssFilters = require('xss-filters');
const pool = require('./students_db.js');

function formatDate(dateString) {
    const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };

    return new Date(dateString).toLocaleDateString('ko-KR', options);
}

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
        <table border="1">
        <tr>
        <th>이름</th>
        <th>등원시간</th>
        <th>등원여부</th>
        <th>버튼</th>
        </tr>
        `;

        console.log(results);

        results.forEach(result => {
            const formattedDate = formatDate(result.student_time);
            html += `
                <tr>
                    <td>${result.student_name}</td>
                    <td>${formattedDate}</td>
                    <td>${result.attendant}</td>
                    <td><button link="/info/attendant">등원</button>
                    <button link="/info/attendant">하원</button>
                    <button link="/info/attendant">결석</button></td>
                </tr>
            `;
        });

        html += `</table></body></html>`;
        res.send(html);
    });
});

module.exports = router;
