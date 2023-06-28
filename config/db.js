const mysql = require('mysql');
const dbInfo = {
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: 'djaakdi120401@$',
    database: 'user_db'
};

module.exports = {
    init: function () {
        return mysql.createConnection(dbInfo);
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql 연결 에러 : ' + err);
            else console.log('mysql 연결 성공');
        });
    }
};