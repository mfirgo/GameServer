var http = require('http');
const path = require('path')
var express = require('express');
var socket = require('socket.io');
var cookieParser= require('cookie-parser');


var app = express();
var rooms = require('./rooms');
const { env } = require('process');

var server = http.createServer(app);
var io = socket(server);

app.use("/css", express.static(__dirname + "/views/css/"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));
app.set('view engine', 'ejs');
app.set('views', './views');
app.disable('etag');
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true
  })
);

function get_username(req, res){
  if(!req.cookies.username) {
    console.log('new player name')
    username = 'anon'
    res.cookie('username', username);
  } 
  else{
    console.log('using old player name')
    username = req.cookies.username;
  }
  return username
}

app.get('/', (req, res) => {
  // console.log("got get request for index");
  roomsTable = rooms.returnRooms();
  username = get_username(req, res);
  res.render('index.ejs', {data: roomsTable, username: username});
});

app.post( '/', (req, res) => {
  if(req.body.roomid)
  {
    rooms.renderRoom(req, res);
  }
  else {
    res.render('index.ejs', {
      data: rooms.returnRooms(),
      message: "You need to write room name."
    })
  }
});

app.get('/usernameChange', (req, res)=>{
  username = get_username(req, res);
  res.render('usernameChange.ejs', {username: username})
})
app.post('/usernameChange', (req, res)=>{
  if(req.body.username){
    res.cookie('username', req.body.username);
    res.redirect('/');
  } else {
    res.render('usernameChange.ejs', {
      username: get_username(req, res),
      message: 'You need to write your new username'});
  }
})

server.listen(process.env.PORT || 3000); 

app.get("/room/:id", (req, res) => { 
  console.log("got get request for room", req.params.id)
  res.render('fourinrow.ejs', {id: req.params.id, username: get_username(req, res)});
  // rooms.renderRoom(req, res);});
});

io.on('connection', function(socket) {
  var player = -1;
  var roomid = "";
  console.log('client connected:', socket.id);
  
  socket.on("join room", data => {
    console.log('server: in room', data.roomID);

    player = rooms.add_player(data.roomID);
    console.log('Player added', player)
    roomid = data.roomID
    socket.join(roomid);
    socket.emit('player-joined', player)
    socket.to(roomid).emit('player-connection', player)
  });
  
  socket.on('disconnect', data => {
    console.log(`socket disconnection, player ${player}`)
    rooms.player_left(roomid, player);
    socket.to(roomid).emit('player-connection', player)
    socket.leave(roomid)
    player = -1;
    roomid = '';
  });

  socket.on('player-ready', data => {
    socket.to(roomid).emit('enemy-ready', player)
    rooms.player_to_value(player, roomid, true)
  })

  socket.on('check-players', data => {
    let playerStatus = rooms.check_players(data.roomID);
    socket.emit('check-players', playerStatus)
  });

  socket.on('square-clicked', data => {
    id = data.id
    console.log(`Square clicked by ${player}`, id)
    socket.to(roomid).emit('square-clicked', id)
  })
});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

console.log( "Server listens" );