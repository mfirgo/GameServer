var http = require('http');
var express = require('express');
var app = express();
var rooms = require('./rooms')

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index.ejs')
});


const MAX_ROOMS = 5

var freerooms = [1,2,3,4,5]

function joiningRoom(res, room) {
  console.log("joining")
  res.end(`Welcome to room - ${room}`)
}

function createRoom(res) {
  console.log("creating")
  let room = freerooms.pop()
  // TODO handle case when we do not have room
  res.redirect('http://localhost:3000/room/' + room);
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

app.get("/room/:id",
 (req, res) => { 
  renderRoom(req, res);});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

http.createServer(app).listen(3000);