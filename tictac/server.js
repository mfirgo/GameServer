const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "tictac")))

server.listen(PORT, () => console.log(`Server started. port ${PORT}`))

const players = [null, null]

io.on('connection', socket => {
  let player = -1

  for(let i in players) {
    if (players[i] === null) {
      players[i] = false
      player = i
      break
    }
  }

  console.log(`New socket connection, player ${player}`)
  socket.emit('player-joined', player)
  socket.broadcast.emit('player-connection', player)
  
  socket.on('disconnect', () => {
    console.log(`socket disconnection, player ${player}`)
    players[player] = null
    socket.broadcast.emit('player-connection', player)
  })

  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', player)
    players[player] = true
  })

  socket.on('check-players', () => {
    let playerStatus = []
    for (let i in players)
      players[i] === null ? playerStatus.push({connected: false, ready: false}) : playerStatus.push({connected: true, ready: false})
    socket.emit('check-players', playerStatus)
  })

  socket.on('square-clicked', id => {
    console.log(`Square clicked by ${player}`, id)
    socket.broadcast.emit('square-clicked', id)
  })
})