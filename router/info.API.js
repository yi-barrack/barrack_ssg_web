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

function isAdmin(req, res, next) {
    if (req.session.username === 'admin') { // Assuming req.user stores user information
        return next(); // User is an admin, proceed to the route
    } else {
        res.status(403).send('어드민만 사용 가능합니다.'); // User is not an admin, send a forbidden response
    }
}

router.get('/attendant/:student_name/:attendant', isAdmin, function (req, res) {
    const studentName = req.params.student_name; // Corrected variable name
    const status = req.params.attendant;

    // Define SQL query based on the status and studentName
    let sql = '';
    switch (status) {
        case '1': // 등원
            sql = 'UPDATE students SET attendant = 1 WHERE student_name = ?';
            break;
        case '0': // 하원
            sql = 'UPDATE students SET attendant = 0 WHERE student_name = ?';
            break;
        case '2': // 결석
            sql = 'UPDATE students SET attendant = 2 WHERE student_name = ?';
            break;
        default:
            return res.status(400).send('Invalid status');
    }

    pool.query(sql, [studentName], function (err, results) {
        if (err) {
            console.log(err);
            return res.status(500).send('Error updating attendance');
        }

        // Redirect back to the main page after updating attendance
        res.redirect('/info');
    });
});


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
            let attendantText = '';

            switch (result.attendant) {
                case 1:
                    attendantText = '등원';
                    break;
                case 0:
                    attendantText = '하원';
                    break;
                case 2:
                    attendantText = '결석';
                    break;
                default:
                    attendantText = 'Unknown'; // Handle unknown values if needed
                    break;
            }

            html += `
        <tr>
            <td>${result.student_name}</td>
            <td>${formattedDate}</td>
            <td>${attendantText}</td>
            <td>
                <a href="/info/attendant/${result.student_name}/1">등원</a>
                <a href="/info/attendant/${result.student_name}/0">하원</a>
                <a href="/info/attendant/${result.student_name}/2">결석</a>
            </td>
        </tr>
    `;
        });

        html += `</table></body></html>`;
        res.send(html);

    });
});



module.exports = router;
