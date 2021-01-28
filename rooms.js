const MAX_ROOMS = 5

var freerooms = [1,2,3,4,5]

function joiningRoom(res, room) {
  res.end(`Welcome to room - ${room}`)
}

function createRoom(res) {
  let room = freerooms.pop()
  joiningRoom(res, room)
}

function renderRoom(req, res) {
  if (Number.isInteger(req.params.id)) {
    let room = req.params.id
    if (room > 0 && room < MAX_ROOMS) {
      if (room in freeroms)
        res.end(`Room not created - ${room}`)
      else
        joiningRoom(res, room)
    }
    else if (req.params.id == 0)
      createRoom(res)
  }
}