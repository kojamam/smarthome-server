`use strict`

const express = require('express');
const router = express.Router();

/* smart home api */
router.post('/', function (req, res, next) {
    let msg;
    if (req.body.token === process.env.ACCESS_TOKEN) {
        res.send({ "result": "accepted" });
    } else {
        res.status(400).send({ "result": "invalid token" });
    }
});

module.exports = router;
