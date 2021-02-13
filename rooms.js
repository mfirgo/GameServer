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
  for (let i in rooms[roomID]) {
    if (players[i] === null)
      playerStatus.push({connected: false, ready: false})
    else if (players[i] === false)
      playerStatus.push({connected: true, ready: false})
    else
      playerStatus.push({connected: true, ready: true})
  }
}


function joiningRoom(res, room) {
  console.log("joining", room)
  // rooms[room].n_players += 1; // increment user counter
  res.redirect('http://localhost:3000/room/' + room)
}

function createRoom(res, room) {
  console.log("creating", room)

  rooms[room] = {
    n_players: 0,
    players: [null, null]
  };
  
  res.redirect('http://localhost:3000/room/' + room);
  // let room = freerooms.pop()
  // if (room === undefined){
  //   // TODO write specific view for 'no rooms are currently available'
  //   res.render('no_rooms_available.ejs')
  // } else{
  //   rooms[room] = {n_players: 0};
  //   rooms[room].players = [null, null];
  //   // usersinroom[room]=0;
  //   res.redirect('http://localhost:3000/room/' + room);
  // }
}

function renderRoom(req, res) {
  console.log("Render", req.body.roomid);
  roomid = req.body.roomid;
  // check if room already exists
  if(rooms[roomid]) {
    console.log("Join already created room", roomid);
    joiningRoom(res, roomid);
  }
  else {
    console.log("Create and join new room", roomid);
    createRoom(res, roomid);
  }

  // if (Number.isInteger(room)) {
  //   if (room > 0 && room <= MAX_ROOMS) {
  //     console.log(room)
  //     console.log(freerooms)
  //     console.log(room in freerooms)
  //     if (freerooms.includes(room))
  //       res.end(`Room not created - ${room}`)
  //     else
  //       joiningRoom(res, room)
  //   }
  //   else if (room == 0)
  //     createRoom(res)
  // }
}

module.exports = {
  renderRoom:renderRoom,
  add_player:add_player,
  player_to_value: player_to_value,
  check_players: check_players
}