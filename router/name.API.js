const express = require('express');
const router = express.Router();


router.get('/', function (req, res) {
    if (req.session.userLoggedIn) {
        res.json({ username : req.session.username });
    } else {
        res.json({ username : null });
    }
});

module.exports = router;
