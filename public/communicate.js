$(function () {
  var socket = io('http://localhost/');
  socket.on('connect', function (){
    console.log('connected home base');
  })

  $('form').submit(function(){
    var address = $('#address').val();
    var eventType = $('#event_type').val();
    var googcoords =[];
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        googcoords = results[0].geometry.location.toString().replace(/\(|\)/g, '').split(', ');
        googcoords[0]= parseFloat(googcoords[0],10);
        googcoords[1]= parseFloat(googcoords[1],10);
        var cordtemp = [googcoords[1],googcoords[0]];
        var date = new Date()
        var timestamp = String(date.getTime());

        console.log(googcoords);
        var geographicdata = {    /*create the GeoJSON*/
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": cordtemp
          },
          "properties": {
            "EventType": eventType,
            "popularity": 0
          }
        };
        console.log(geographicdata);
        socket.emit('chat message',geographicdata);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

    var myurl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + config.GOOGLE_API_KEY;
    $('#address').val('');
    $('#event_type').val('');

    return false;
  });

  socket.on('chat message', function(msg){
    console.log('recieved chat messege');
    console.log(msg.features);
    for (var i = 0; i < msg.features.length; i++) {

      var coords = msg.features[i].geometry.coordinates;
      var latLng = new google.maps.LatLng(coords[1],coords[0]);
      var marker = new google.maps.Marker({
        position: latLng,
        map: map
      });
      //The display of InfoWindows:
      var display = '<button id="increasepopularity" onclick= "upvote(' +String(msg.features[i].properties.id)+ ')">increase</button>'+
      msg.features[i].properties.EventType +' ' + msg.features[i].properties.popularity;

      marker['infowindow'] = new google.maps.InfoWindow({
        content: display
      });

      google.maps.event.addListener(marker, 'click', function() {
        this['infowindow'].open(map, this);
        console.log(marker);
      });

    }
  });

});
