$(function () {
  var socket = io();

  $('form').submit(function(){
    var address = $('#address').val();
    var eventType = $('#event_type').val();
    var googcoords =[];
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);

      /*  googcoords =Object.keys(results[0].geometry.location).map(function(key){
          reuturn [Number(key),results[0].geometry.location[key]];
        });

      */

        googcoords = results[0].geometry.location.toString().replace(/\(|\)/g, '').split(', ');
        googcoords[0]= parseFloat(googcoords[0],10);
        googcoords[1]= parseFloat(googcoords[1],10);
        var cordtemp = [googcoords[1],googcoords[0]];

        console.log(googcoords);
        var geographicdata = {    /*create the GeoJSON*/
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": cordtemp
          },
          "properties": {
            "EventType": eventType
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
    console.log(msg.features);
    for (var i = 0; i < msg.features.length; i++) {
      var coords = msg.features[i].geometry.coordinates;
      var latLng = new google.maps.LatLng(coords[1],coords[0]);
      var marker = new google.maps.Marker({
        position: latLng,
        map: map
      });
    }
  });

});
