const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
require('dotenv').config();
const connection = {
    host: 'localhost',
    port: '3306',
    user: 'barrack',
    password: process.env.MYSQL_PASSWORD,
    database: 'clients'
}

// routers
const loginRouter = require('./router/Login.API');
const cookieRouter = require('./router/Cookie.API');
const registerRouter = require('./router/register');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use를 통해 /static으로 들어오면 public 폴더에 파일들 보냄.
app.use('/', express.static('public'));
// cookieparser 사용
app.use(cookieParser());

//register post 데이터 받기
app.use('/register', registerRouter);

// login post 데이터 받기
app.use('/login', loginRouter);

app.use('/cookie', cookieRouter);
//app.use('/login', loginRouter);
let port = 5555;

app.listen(port, () => {
    console.log('server on! http://localhost:' + port);
});