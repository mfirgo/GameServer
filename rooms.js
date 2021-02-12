const MAX_ROOMS = 5

var freerooms = [1,2,3,4,5,]
var usersinroom = {} // user counter for each room
var rooms = {}

function add_player(roomID) {
  console.log('rooms: in add player to room', roomID)
  if(rooms[roomID]) {
    console.log('in if')
    var playerID = rooms[roomID].n_players;
    //rooms[roomID].players = [];
    //rooms[roomID].players[playerID] = false;
    rooms[roomID].n_players += 1;
    return playerID;
  }
  console.log('outside if')
  rooms[roomID] = {n_players: 1};
  rooms[roomID].players = [null, null];
  return 0;
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
  usersinroom[room] +=1; // increment user counter
  res.render('tictac.ejs', {id: room})
}

function createRoom(res) {
  console.log("creating")
  let room = freerooms.pop()
  if (room === undefined){
    // TODO write specific view for 'no rooms are currently available'
    res.render('no_rooms_available.ejs')
  } else{
    rooms[room] = {n_players: 0};
    rooms[room].players = [null, null];
    // usersinroom[room]=0;
    res.redirect('http://localhost:3000/room/' + room);
  }
}

function renderRoom(req, res) {
  console.log("render", req.params.id)
  let room = parseInt(req.params.id)
  console.log("still here ", room)

  if (Number.isInteger(room)) {
    if (room > 0 && room <= MAX_ROOMS) {
      console.log(room)
      console.log(freerooms)
      console.log(room in freerooms)
      if (freerooms.includes(room))
        res.end(`Room not created - ${room}`)
      else
        joiningRoom(res, room)
    }
    else if (room == 0)
      createRoom(res)
  }
}

module.exports = {
  renderRoom:renderRoom,
  add_player:add_player,
  player_to_value: player_to_value,
  check_players: check_players
}