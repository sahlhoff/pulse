//pulse.js

var five = require("johnny-five"),
    express = require("express"),
    app = express(),
    http = require("http"),
    server = http.createServer(app),
    sio = require("socket.io").listen(server),
    path = require('path'),
    board, sensor;

app.use('/', express.static( path.normalize( __dirname + '/../public')) );

server.listen(8082);
pulse = sio.of('/pulse');

board = new five.Board();
board.on("ready", function() {
  console.log('=======================Ready')
  // Create a new `sensor` hardware instance.
  sensor = new five.Sensor({
    pin: "A5",
    freq: 25
  });

  sensor.scale([ 50, 100 ]).on("read", function() {
    pulse.emit('pulse', this.scaled);
  });
});