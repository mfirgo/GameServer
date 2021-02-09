var http = require('http');
const path = require('path')
var express = require('express');
var socket = require('socket.io');

var app = express();
var rooms = require('./rooms')

var server = http.createServer(app);
var io = socket(server);

// źle app.use(express.static(path.join(__dirname, "tictac_")))

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
  var player = -1;
  var roomid = "";
  console.log('client connected:' + socket.id);
  
  socket.on("join room", (data) => {
    console.log('in room');

    player = rooms.add_player(data.roomID);
    
    roomid = data.roomID
    socket.join(roomid);
  });

  socket.emit('player-joined', player)
  //TO DO - render that room is full
  if(player == -1)
    return

  socket.to(roomid).emit('player-connection', player)
  
  socket.on('disconnect', () => {
    console.log(`socket disconnection, player ${player}`)
    rooms.player_to_value(player, roomid, null);
    socket.to(roomid).emit('player-connection', player)
  })

  socket.on('player-ready', () => {
    socket.to(roomid).emit('enemy-ready', player)
    rooms.player_to_value(player, roomid, true)
  })

  socket.on('check-players', () => {
    let playerStatus = rooms.check_players(roomid);

    socket.emit('check-players', playerStatus)
  })

  socket.on('square-clicked', id => {
    console.log(`Square clicked by ${player}`, id)
    socket.to(roomid).emit('square-clicked', id)
  })
});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

console.log( "Server listens" );