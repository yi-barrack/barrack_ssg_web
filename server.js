const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path');
require('dotenv').config();


// 라우터
const loginRouter = require('./router/Login.API');
const cookieRouter = require('./router/Cookie.API');
const registerRouter = require('./router/register');
const nameRouter = require('./router/name.API');
const boardRouter = require('./router/boardRouter');
const postsRouter = require('./router/Posts.API');
const infoRouter = require('./router/info.API');

// 세션
const session = require('express-session');
const { brotliCompress } = require('zlib');
const { Domain } = require('domain');
const { domainToASCII } = require('url');
const { Session } = require('inspector');
const { log, info } = require('console');

/*
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://kindergarden.newbie.battle.sejongssg.kr");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
*/

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        //maxAge: 60*60*1000*50, // 1 시간동안 세션쿠기 유지
        // path: '/',
        Domain: 'http://kindergarden.newbie.battle.sejongssg.kr',
        //Domain: 'http://sejongssg.kr',
        sameSite: 'lax'
    }
}));

// 정적 파일 제공 미들웨어를 먼저 적용합니다.
app.use('/', express.static('public'));
app.use('/for_users', ensureAuthenticated, express.static('for_users'));

// 로그인과 회원가입 라우트를 먼저 정의합니다.
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/username', nameRouter);
app.use('/new', boardRouter);
app.use('/posts', postsRouter);

// 로그인 확인 미들웨어
function ensureAuthenticated(req, res, next) {
    //console.log(req.headers)
    if (!req.session.userLoggedIn) {
        res.redirect('/');
    } else {
        next();
    }
}

// 나머지 라우트를 정의합니다.
app.use('/board', ensureAuthenticated, boardRouter);
app.use('/cookie', cookieRouter);
app.use('/info', ensureAuthenticated, infoRouter);

//app.head('/', function (req, res) {
//    console.log(req.headers)
//});

// 로그인 한 유저라면 로그인 이후 페이지, 아니라면 index.html
app.get('/', function (req, res) {
    if (req.session.userLoggedIn) {
        res.redirect('/for_users/login_index.html');
    } else {
        res.sendFile(path.join(__dirname, '/public/index.html'));
    }
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.sendStatus(200);
});


let port = 1234;

app.listen(port, () => {
    console.log('server on! http://127.0.0.1:1234');
});
