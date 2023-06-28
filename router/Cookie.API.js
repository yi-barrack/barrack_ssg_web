const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const text = req.body.text;
    res.cookie('Text', text);
    console.log(req.cookies.Text);
    res.render('Cookie' , {'text' : text});
});

module.exports = router;