var http = require('http');
var express = require('express');

var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use( express.static( "./static") );

app.get('/', (req, res) => {
    res.render('index', {username:'foo'})
});

app.use((req,res,next) =>{res.render('404.ejs', { url :req.url});});

server = http.createServer(app)
server.listen(3000) 