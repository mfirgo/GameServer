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

server.listen(3000); 

app.get("/room/:id",
 (req, res) => { 
  rooms.renderRoom(req, res);});

io.on('connection', function(socket) {
  console.log('client connected:' + socket.id);
  socket.on("join room", (data) => {
    console.log('in room');
    
    //io.to(Newuser.roomname).emit('send data' , {username : Newuser.username,roomname : Newuser.roomname, id : socket.id})
    // io.to(socket.id).emit('send data' , {id : socket.id ,username:Newuser.username, roomname : Newuser.roomname });
    
    var roomID = data.roomID
    socket.join(roomID);
  });
  
  socket.on('chat message', function(data) {
      io.to(data.roomID).emit('chat message', data.msg); // do wszystkich
      // socket.emit('chat message', data); // tylko do połączonego
  });
});

setInterval( function() {
  var date = new Date().toString();
  io.emit( 'message', date.toString() );
}, 1000 );

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

console.log( "Server listens" );