const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    var id = req.body.id;
    var psw = req.body.psw;
    console.log("id : ", id);
    console.log("psw : ", psw);
    res.send(
        `<p>당신의 아이디는 : ${id}</p>
        <p>당신의 비밀번호는 : ${psw}</p>`
    )
});








module.exports = router;