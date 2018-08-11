`use strict`

/**
 * Dependency
 */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
let WebSocketServer = require('websocket').server;

/**
 * Initialization
 */
dotenv.config();
const app = express();

/**
 * express configuuration
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * express routing
 */
app.post('/home', function (req, res, next) {
  let msg;
  sendToClient(JSON.stringify(req.body));
  if (req.body.token === process.env.ACCESS_TOKEN) {
    res.send({ "result": "accepted" });
  } else {
    res.status(400).send({ "result": "invalid token" });
  }
});

/**
 * Start server
 */
let port = process.env.PORT || 5000;
let server = app.listen(port, () => {
  console.log("Node.js is listening to PORT:" + server.address().port);
});

/**
 * WebSocket
 */
wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  //TODO ここで接続元を見る
  console.log(origin);
  return true;
}

let connection = null;

wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  connection = request.accept('khp', request.origin);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on('close', function (reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    connection = null;
  });
});

function sendToClient(payload) {
  connection.sendUTF(payload);
}
