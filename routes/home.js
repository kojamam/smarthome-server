`use strict`

const express = require('express');
const router = express.Router();
const ws = require('../lib/ws');

/* smart home api */
router.post('/', function (req, res, next) {
    let msg;
    ws(JSON.stringify(req.body));
    if (req.body.token === process.env.ACCESS_TOKEN) {
        res.send({ "result": "accepted" });
    } else {
        res.status(400).send({ "result": "invalid token" });
    }
});

module.exports = router;
