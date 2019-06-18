var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "karta3"

});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use(express.static(__dirname));
//get the html file
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
//Socket.io part, waits for messeges and then updates the map and sends it out
io.on('connection', function(socket){
  var currentEvents;

  var sql = "SELECT Longitude,Latitude,EventType,Popularity,EventPostDate,ID FROM userevents WHERE EventPostDate BETWEEN DATE_SUB(NOW(), INTERVAL 1 DAY) AND NOW()";

  con.query(sql, function (err, result) {
    console.log(result.length);
    if (err) throw err;
    var currentEvents = {
      "type":"FeatureCollection",
      "features":[]
    };

    for (var i = 0; i < result.length; i++) {
      currentEvents.features[i]= {
        "type":"Feature",
        "geometry":{
          "type":"Point",
          "coordinates":[
            result[i].Longitude,
            result[i].Latitude
          ]
        },
        "properties":{
          "EventType":result[i].EventType,
          "date":result[i].EventPostDate,
          "popularity":result[i].Popularity,
          "id":result[i].ID
        }
      };
    }
    console.log(currentEvents);
    io.emit('chat message', currentEvents);
  });

  console.log('user connected');


  socket.on('chat message', function(msg){
    //friendly greetings
    console.log('recieved coordinate data');
    //put new messeges in the old messeges
    //  superFunction = require(__dirname + '/messeges.json');

    console.log('Coordinate data retrieved:');
    //console.log(superFunction.features);

    //superFunction.features.push(msg);
    var coords = msg.geometry.coordinates;
    //limiting to 7 decimals.
    var eventdata = [
      parseFloat(coords[0].toFixed(5)),
      parseFloat(coords[1].toFixed(5)),
      msg.properties.EventType,
      msg.properties.popularity
    ];
    //SQL Query, inserting values

    console.log(eventdata);

    var sql = "INSERT INTO userevents (Longitude,Latitude,EventType,Popularity,EventPostDate) VALUES (?,?,?,?,NOW())";

    con.query(sql, eventdata, function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
    });


    //SQL Query, retrieving values
    var sql = "SELECT Longitude,Latitude,EventType,Popularity,EventPostDate,ID FROM userevents WHERE EventPostDate BETWEEN DATE_SUB(NOW(), INTERVAL 1 DAY) AND NOW()";

    con.query(sql, function (err, result) {
      console.log(result.length);
      if (err) throw err;
      var currentEvents = {
        "type":"FeatureCollection",
        "features":[]
      };

      for (var i = 0; i < result.length; i++) {
        currentEvents.features[i]= {
          "type":"Feature",
          "geometry":{
            "type":"Point",
            "coordinates":[
              result[i].Longitude,
              result[i].Latitude
            ]
          },
          "properties":{
            "EventType":result[i].EventType,
            "date":result[i].EventPostDate,
            "popularity":result[i].Popularity,
            "id":result[i].ID
          }
        };
      }
      //send out to clients
      console.log(currentEvents);
      io.emit('chat message', currentEvents);

    });



    //sent the messege
    console.log('map updated');
  });


//when user upvotes
  socket.on('upvote', function(i){

    console.log('upvoting '+i);

    var sql = "UPDATE userevents SET Popularity = Popularity+1 WHERE ID =" +String(i);
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
    });



    var sql = "SELECT Longitude,Latitude,EventType,Popularity,EventPostDate,ID FROM userevents WHERE EventPostDate BETWEEN DATE_SUB(NOW(), INTERVAL 1 DAY) AND NOW()";

    con.query(sql, function (err, result) {
      console.log(result.length);
      if (err) throw err;
      var currentEvents = {
        "type":"FeatureCollection",
        "features":[]
      };

      for (var i = 0; i < result.length; i++) {
        currentEvents.features[i]= {
          "type":"Feature",
          "geometry":{
            "type":"Point",
            "coordinates":[
              result[i].Longitude,
              result[i].Latitude
            ]
          },
          "properties":{
            "EventType":result[i].EventType,
            "date":result[i].EventPostDate,
            "popularity":result[i].Popularity,
            "id":result[i].ID
          }
        };
      }
      console.log(currentEvents);
      io.emit('chat message', currentEvents);
      
    });
  });
});

//define which port
http.listen(80, function(){
  console.log('listening on *:80');
});
