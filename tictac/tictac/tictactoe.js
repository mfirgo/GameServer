document.addEventListener('DOMContentLoaded', () =>{
  const userGrid = document.querySelector('.grid-user')
  const startButton = document.querySelector('#start')
  const leaveButton = document.querySelector('#leave')
  const turnDisplay = document.querySelector('#whose-move')
  const infoDisplay = document.querySelector('#info')

  
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
  let moveDone = -1
  let playerNum = 0

  const socket = io()

  socket.on('player-joined', num => {
    if (num === -1)
      infoDisplay.innerHTML = "Sorry, the room is full :("
    else {
      playerNum = parseInt(num)
      console.log(`Joined ${playerNum}`)
    }

    socket.emit('check-players')
  })

  socket.on('player-connection', num => {
    console.log(`Player dis/connected ${num}`)
    playerConnectionChange(num)
  })

  socket.on('enemy-ready', num => {
    playerReady(num)
    if (ready)
      startGame(socket)
  })

  socket.on('check-players', playerStatus => {
    playerStatus.forEach((p, i) => {
      if(p.connected)
        playerConnectionChange(i)
      if(p.ready)
        playerReady(i)
    })
  })

  socket.on('square-clicked', id => {
    revealSquare(usersSquares[id])
  })

  function playerConnectionChange(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .connected span`).classList.toggle('green')
    if (num == playerNum)
      document.querySelector(player).style.fontWeight = 'bold'
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
    if (!gameEnd)
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
      playerMove = 1
      infoDisplay.innerHTML = "Game in progress"
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
    let count = 0
    let prev = 0
    for (let row = 0; row < height; row++) {
      for(let col = 0; col < width; col++) {
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

  function checkBoard() {

    let res = checkRows()
    if (res == 0)
      res = checkColumns()

    if (res != 0) {
      gameEnd = true
      ready = enemyReady = false

      document.querySelector(`.p1 .ready span`).classList.toggle('green')
      document.querySelector(`.p2 .ready span`).classList.toggle('green')
      infoDisplay.innerHTML = `Player ${res} won!`
      turnDisplay.innerHTML = ""
    }

  }

  function clickSquare(square) {
    if(square.classList.contains('player1') ||
       square.classList.contains('player2') ||
       playerNum != playerMove ||
       gameEnd)
      return

    console.log(`clicked by ${playerNum}, turn - ${playerMove}`)
    let id = square.dataset.id
    socket.emit('square-clicked', id)
    revealSquare(square)
  }

  function revealSquare(square) {
    square.classList.add('player' + playerMove)
    playerMove = (playerMove + 1) % 2
    turnDisplay.innerHTML = `Player ${playerMove + 1} move`
    checkBoard()
  }

})