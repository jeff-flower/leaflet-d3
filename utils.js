var _ = require('lodash');
var locations = require('./locations.js');

// return the latitude and longitude from a google api response
function filterLatLong(data) {
  return [data.results[0].geometry.location.lat,data.results[0].geometry.location.lng];
}

// latLngArr returned by filterLatLong
// return locations within a certain radius of the lat and long point
function filterLocations(latLngArr) {

  //get lat lng
  var lat = latLngArr[0];
  var lng = latLngArr[1];
  
  var filterRadius = 0.5;

  // filter by distance from geocode 
  var filteredMarkers = _.filter(locations, function(location) {
    return  (lat - filterRadius < location.coordinates[0] && location.coordinates[0] < lat + filterRadius && lng - filterRadius < location.coordinates[1] && location.coordinates[1] < lng + filterRadius)
  });
  
  return filteredMarkers;
}

module.exports.filterLatLong = filterLatLong;
module.exports.filterLocations = filterLocations;
