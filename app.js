var http = require('http');
var express = require('express');
var socket = require('socket.io');


var app = express();
var rooms = require('./rooms')

var server = http.createServer(app);
var io = socket(server);

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.get("/room/:id",
 (req, res) => { 
  rooms.renderRoom(req, res);});

server.listen(3000);

io.on('connection', function(socket) {
  console.log('client connected:' + socket.id);
  socket.on('chat message', function(data) {
      // io.emit('chat message', data); // do wszystkich
      socket.emit('chat message', data); // tylko do połączonego
  })
});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

console.log( "Server ready" );