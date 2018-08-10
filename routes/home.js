`use strict`

const express = require('express');
const router = express.Router();

/* smart home api */
router.post('/', function (req, res, next) {
    console.log(req.body);
    res.send({"aa":"aa"});
});

module.exports = router;
