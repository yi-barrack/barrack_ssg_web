const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path');
require('dotenv').config();

// 라우터
const loginRouter = require('./router/Login.API');
const cookieRouter = require('./router/Cookie.API');
const registerRouter = require('./router/register');

// 세션
const session = require('express-session');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 60 * 60 * 1000 // 1 시간동안 세션쿠기 유지
    }
}));


app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/cookie', cookieRouter);

// 로그인 한 유저라면 로그인 이후 페이지, 아니라면 index.html
app.get('/', function (req, res) {
    if (req.session.userLoggedIn) {
        res.sendFile(path.join(__dirname, '/public/login_index.html'));
    } else {
        res.sendFile(path.join(__dirname, './public/index.html'));
    }
});

app.use('/', express.static('public'));

let port = 5555;

app.listen(port, () => {
    console.log('server on! http://localhost:' + port);
});
