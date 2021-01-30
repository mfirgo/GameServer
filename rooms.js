//const MAX_ROOMS = 5
const MAX_ROOMS = 1

//var freerooms = [1,2,3,4,5]
var freerooms = [1]

function joiningRoom(res, room) {
  console.log("joining")
  res.end(`Welcome to room - ${room}`)
}

function createRoom(res) {
  console.log("creating")
  let room = freerooms.pop()
  if (room === undefined){
    // TODO write specific view for 'no rooms are currently available'
    res.render('no_rooms_available.ejs')
  } else{
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