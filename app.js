var http = require('http');
const path = require('path')
var express = require('express');
var socket = require('socket.io');

var app = express();
var rooms = require('./rooms')

var server = http.createServer(app);
var io = socket(server);

app.use("/css", express.static(__dirname + "/views/css/"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(
  express.urlencoded({
    extended: true
  })
)

app.get('/', (req, res) => {
  console.log("got get request for index");
  res.render('index.ejs')
});

server.listen(3000); 

app.get("/room/:id",
 (req, res) => { 
  console.log("got get request for room", req.params.id)
  rooms.renderRoom(req, res);});

io.on('connection', function(socket) {
  var player = -1;
  var roomid = "";
  console.log('client connected:' + socket.id);
  
  socket.on("join room", data => {
    console.log('server: in room', data.roomID);

    player = rooms.add_player(data.roomID);
    console.log('Player added', player)
    roomid = data.roomID
    socket.join(roomid);
    socket.to(roomid).emit('player-joined', player)
    socket.to(roomid).emit('player-connection', player)
  });

  //TO DO - render that room is full
  //if(player == -1)
  //  return

  
  socket.on('disconnect', data => {
    console.log(`socket disconnection, player ${player}`)
    rooms.player_to_value(player, roomid, null);
    socket.to(data.roomID).emit('player-connection', player)
  })

  socket.on('player-ready', data => {
    socket.to(roomid).emit('enemy-ready', player)
    rooms.player_to_value(player, roomid, true)
  })

  socket.on('check-players', data => {
    let playerStatus = rooms.check_players(data.roomID);

    socket.to(data.roomID).emit('check-players', playerStatus)
  })

  socket.on('square-clicked', data => {
    id = data.id
    console.log(`Square clicked by ${player}`, id)
    socket.to(data.roomID).emit('square-clicked', id)
  })
});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

console.log( "Server listens" );