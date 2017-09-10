const path = require('path');
const express = require('express');
const lusca = require('lusca');
const bodyParser = require('body-parser')

const config = require('./config');

const server = express();

server.use(lusca());
server.use(bodyParser.json());
server.use(express.static(path.join(__dirname, 'client')));

server.post('/update-position', function(req, res) {
  config.location = req.body.location;
  res.sendStatus(200);
});

server.get('/tolerances', function(req, res) {
  res.send(config.tolerance);
});

server.post('/tolerances', function(req, res) {
  config.tolerance = req.body;
  res.sendStatus(200);
})

module.exports = server;