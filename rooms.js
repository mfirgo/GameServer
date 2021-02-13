var rooms = {}

function add_player(roomID) {
  console.log('rooms: add player to room', roomID)
  var playerID = rooms[roomID].n_players;
  rooms[roomID].n_players += 1;
  rooms[roomID].players[playerID] = false;
  return playerID;
}

function player_to_value(playerID, roomID, v) {
  rooms[roomID].players[playerID] = v;
}

function check_players(roomID) {
  var playerStatus = [];
  for (let i in rooms[roomID].players) {
    if (rooms[roomID].players[i] === null)
      playerStatus.push({connected: false, ready: false})
    else if (rooms[roomID].players[i] === false)
      playerStatus.push({connected: true, ready: false})
    else
      playerStatus.push({connected: true, ready: true})
  }
  return playerStatus;
}


function joiningRoom(res, room) {
  if(rooms[room].n_players < 2) {
    console.log("joining", room)
    res.redirect('http://localhost:3000/room/' + room)
  }
  else {
    console.log("Tried to join full room");
    res.render('index.ejs', {message: "Room is full. Please select another room."});
  }
}

function createRoom(res, room) {
  console.log("creating", room)
  rooms[room] = {
    n_players: 0,
    players: [null, null]
  };
}

function renderRoom(req, res) {
  console.log("Render", req.body.roomid);
  roomid = req.body.roomid;
  // check if room already exists
  if(!rooms[roomid]) {
    console.log("Create and join new room", roomid);
    createRoom(res, roomid);
  }
  joiningRoom(res, roomid);
}

module.exports = {
  renderRoom:renderRoom,
  add_player:add_player,
  player_to_value: player_to_value,
  check_players: check_players
}