'use strict'

/**
 * Dependency
 */
const express = require('express');
const path = require('path');
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * express routing
 */
app.post('/', function (req, res, next) {
  let msg;
  let sendBody = {
    'commands': req.body.commands
  }
  sendToClient(JSON.stringify(sendBody));
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
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});
console.log(process.env.ACCESS_TOKEN)
let connection = null;

const originIsAllowed = (origin) => {
  if (origin !== process.env.ACCESS_TOKEN || connection !== null) {
    return false;
  }
  return true;
}


wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  connection = request.accept('hcp', request.origin); //hcp=home control protocol
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    }
  });
  connection.on('close', function (reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    connection = null;
  });
});

const sendToClient = (payload) => {
  connection.sendUTF(payload);
}
