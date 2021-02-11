document.addEventListener('DOMContentLoaded', () =>{
  const userGrid = document.querySelector('.grid-user')
  const startButton = document.querySelector('#start')
  const leaveButton = document.querySelector('#leave')
  const turnDisplay = document.querySelector('#whose-move')
  const infoDisplay = document.querySelector('#info')
  console.log("in tictactoe script")
  console.log("roomid", roomid)
  
  startButton.addEventListener('click', () => {startGame(socket)})
  leaveButton.addEventListener('click', leaveRoom)

  var usersSquares = []

  const width = 7
  const height = 6
  const inRow = 4

  var playerMove = 1
  let gameEnd = true
  let ready = false
  let enemyReady = false
  let playerNum = 0

  const socket = io()
  socket.emit("join room", {roomID: roomid});
  socket.on('player-joined', num => {
    console.log('got message: player-joined', num)
    if (num === -1){
      infoDisplay.innerHTML = "Sorry, the room is full :("
    }
    else {
      playerNum = parseInt(num)
      console.log(`Joined ${playerNum}`)
    }

    socket.emit('check-players', {roomID: roomid})
  })

  socket.on('player-connection', num => {
    console.log(`Player dis/connected ${num}`)
    playerConnectionChange(num)
  })

  socket.on('enemy-ready', num => {
    console.log('enemy-ready')
    playerReady(num)
    if (ready)
      startGame(socket)
  })

  socket.on('check-players', playerStatus => {
    console.log('check-players')
    playerStatus.forEach((p, i) => {
      console.log(`Checking ${i}, connected ` + p.connected + ' ready: ' + p.ready)
      if(p.connected)
        playerConnectionChange(i)
      if(p.ready)
        playerReady(i)
    })
  })

  socket.on('square-clicked', id => {
    print("got message squere-clicked")
    revealSquare(usersSquares[id])
  })

  function playerConnectionChange(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .connected span`).classList.toggle('green')
    if (num == playerNum)
      document.querySelector(player).style.fontWeight = 'bold'

    if(!gameEnd) {
      gameFinished()
      turnDisplay.innerHTML = ``
      infoDisplay.innerHTML = "Enemy left - you won"
    }
  }

  function createBoard(grid, squares, width, height) {
    console.log('Creating Board')
    for (let i = 0; i < width * height; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
      usersSquares.forEach(square => square.addEventListener('click', function(e) {
        clickSquare(square)
      }))
    }
  }

  createBoard(userGrid, usersSquares, width, height)

  function clearBoard() {
    for (let row = 0; row < height; row++) {
      for(let col = 0; col < width; col++) {
        let position = row * width + col
        usersSquares[position].classList.remove('player1')
        usersSquares[position].classList.remove('player0')
      }
    }
  }

  function startGame(socket) {
    if (!gameEnd || playerNum == -1)
      return

    console.log("startGame")
    clearBoard()
    if(!ready) {
      socket.emit('player-ready')
      infoDisplay.innerHTML = "Waiting for oponnent"
      ready = true
      playerReady(playerNum)
    }

    if (enemyReady) {
      turnDisplay.innerHTML = `Player 1 move`
      infoDisplay.innerHTML = "Game in progress"
      playerMove = 1
      gameEnd = false
    }
  }

  function playerReady(num) {
    if (num != playerNum)
      enemyReady = true
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready span`).classList.toggle('green')
  }

  function leaveRoom() {
    if (!gameEnd)
      return
    //TODO
  }

  function commonCheck(position, count, prev) {
    if (usersSquares[position].classList.contains('player1')) {
      if(prev != 1)
        count = 0
      count++;
      prev = 1
    }
    else if (usersSquares[position].classList.contains('player0')) {
      if(prev != 2)
        count = 0
      count++;
      prev = 2
    }
    else {
      count = 0
      prev = 0
    }
    return [count, prev]
  }

  function checkRows() {
    let sum = 0
    let count = 0
    let prev = 0
    for (let row = 0; row < height; row++) {
      for(let col = 0; col < width; col++) {
        let position = row * width + col
        let res = commonCheck(position, count, prev)
        count = res[0]
        prev = res[1]
        if (count != 0)
          sum++
        if (count == inRow)
          return prev
      }
      prev = 0
    }

    if(sum == height * width)
      return -1

    return 0;
  }

  function checkColumns() {
    let count = 0
    let prev = 0 
    for(let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        let position = row * width + col
        let res = commonCheck(position, count, prev)
        count = res[0]
        prev = res[1]
        if (count == inRow)
          return prev
      }
      prev = 0
    }
    return 0;
  }

  function gameFinished() {
    gameEnd = true
    ready = enemyReady = false

    document.querySelector(`.p1 .ready span`).classList.toggle('green')
    document.querySelector(`.p2 .ready span`).classList.toggle('green')
  }

  function checkBoard() {
    let res = checkRows()
    if (res == 0)
      res = checkColumns()

    if (res != 0) {
      gameFinished()
      if (res == -1)
        infoDisplay.innerHTML = `Draw!`
      else
        infoDisplay.innerHTML = `Player ${res} won!`
      turnDisplay.innerHTML = ""
    }
  }

  function clickSquare(square) {
    if(square.classList.contains('player1') ||
       square.classList.contains('player0') ||
       playerNum != playerMove ||
       gameEnd)
      return

    console.log(`clicked by ${playerNum}, turn - ${playerMove}`)
    let id = square.dataset.id
    socket.emit('square-clicked',{roomID: roomid, id: id})
    revealSquare(square)
  }

  function revealSquare(square) {
    square.classList.add('player' + playerMove)
    playerMove = (playerMove + 1) % 2
    turnDisplay.innerHTML = `Player ${playerMove + 1} move`
    checkBoard()
  }

})