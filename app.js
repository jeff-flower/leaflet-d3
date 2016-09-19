var express = require('express');
var path = require('path');
var utils = require('./utils.js');
var request = require('request');

var app = express();

// Set port
app.set('port', process.env.PORT || 8000);

/* Add a route to the server:
   app.get(<route string>, function(req, res) {
   res.sendFile(path.join(__dirname, <path to file>));
   });

   note that <path to file> should be relative to the src directory
*/
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/locations', function(req, res){
  var key = 'AIzaSyCRwGW4FsCRzmTadDXXX-QzR8LghNv4d4s';
  var target = req.query.q;
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + target  + '&key=' + key;

  request( url, function (error, response, body){
    var jsonObject= JSON.parse(body);
    var latLongArr = utils.filterLatLong(jsonObject);

    if (!error) {
      // pass back the latitude and longitude so the map can zoom to it
      var resObj = {
        center: latLongArr,
        locations: utils.filterLocations(latLongArr)
      };

      res.send(resObj);
    } else
      res.send(error);
  });
});

// Declare a static folder so our html files can pull the resources they need
app.use('/', express.static(path.join(__dirname, '/')));

app.listen(app.get('port'), function() {
  console.log("App listening on port: " + app.get('port'));
});
