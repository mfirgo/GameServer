const MAX_ROOMS = 5

var freerooms = [1,2,3,4,5]
var roomusers = {} // user counter for each room


function joiningRoom(res, room) {
  console.log("joining")
  roomusers[room] +=1; // increment user counter
  res.render('room.ejs', {id: room, users: roomusers[room]})
}

function createRoom(res) {
  console.log("creating")
  let room = freerooms.pop()
  if (room === undefined){
    // TODO write specific view for 'no rooms are currently available'
    res.render('no_rooms_available.ejs')
  } else{
    roomusers[room]=0;
    res.redirect('http://localhost:3000/room/' + room);
  }
}

function renderRoom(req, res) {
  console.log("render")
  let room = parseInt(req.params.id)

  if (Number.isInteger(room)) {
    if (room > 0 && room <= MAX_ROOMS) {
      if (room in freerooms)
        res.end(`Room not created - ${room}`)
      else
        joiningRoom(res, room)
    }
    else if (room == 0)
      createRoom(res)
  }
}

module.exports = {
  renderRoom:renderRoom
}