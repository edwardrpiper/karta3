var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});

//con.connect(function(err) {
//  if (err) throw err;
//  console.log("Connected!");
//});

app.use(express.static(__dirname));
//get the html file
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
//Socket.io part, waits for messeges and then updates the map and sends it out
io.on('connection', function(socket){
  var superFunction = require(__dirname + '/messeges.json');
  console.log('wassaap');
  io.emit('chat message', superFunction);
  socket.on('chat message', function(msg){
    //friendly greetings
    console.log('test');
    //put new messeges in the old messeges
    superFunction = require(__dirname + '/messeges.json');
    console.log('i made it this far');
    console.log(superFunction.features);
    superFunction.features.push(msg);
    //send the messege
    io.emit('chat message', superFunction);
    console.log('map updated');
    //save the messege, convert from JSON
    var geodata = JSON.stringify(superFunction);
    //put back into the messeges JSON file.
    fs.writeFile("messeges.json", geodata, 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    });

  });
});
//define which port
http.listen(80, function(){
  console.log('listening on *:80');
});
