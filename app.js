var http = require('http');
var express = require('express');
var app = express();
var rooms = require('./rooms')

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.get("/room/:id",
 (req, res) => { 
  rooms.renderRoom(req, res);});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

http.createServer(app).listen(3000);