var currentMarkers = [ ];
var marker = [];

function drawMarkers(){
  var lat = 0;
  var lng =0;

  //console.log('marker number', marker.length);

  //remove current markers
  if (marker.length > 0){
    for(i=0; i<marker.length;i++) {
      mymap.removeLayer(marker[i]);
    };
    marker = [];
  }
  var target = document.getElementById("in").value;
  var url = '/locations?q=' + target;

  $.ajax({
    url: url,
    dataType: 'JSON',
    jsonpCallback: 'callback',
    type: 'GET',

    //If success
    success: function (data) {
      var lat = data.center[0];
      var lng = data.center[1];
      var currentMarkers = data.locations;

      // center the map on search location
      mymap.setView([lat, lng], 13);

      //plot on map
      for(i=0;i<currentMarkers.length;i++){
        var LamMarker = new L.marker([currentMarkers[i].coordinates[0], currentMarkers[i].coordinates[1]], { tags: [currentMarkers[i].tags] }, {
          riseOnHover: true,
        }).bindPopup("<h4>" + currentMarkers[i].name + "</h4>" + currentMarkers[i].address + "<br>" + currentMarkers[i].city + ", "+ currentMarkers[i].state + " " + currentMarkers[i].zip+
                     '<br><a href= "http://maps.google.com/?q=' + currentMarkers[i].address + " " + currentMarkers[i].city + ", " + currentMarkers[i].state + " " + currentMarkers[i].zip + '"> Directions </a>'
                    );
        marker.push(LamMarker);
        mymap.addLayer(marker[i]);
      }
    }
  });
  //return false;
}

$('#form').submit( function () {
  drawMarkers();
  return false;
})


function onMarkerClick(e) {
  console.log(e);
}

// filter
L.control.tagFilterButton({
  data: ['jeanie', 'jeanie west'],
  icon: '<img src="images/filter.png">'
}).addTo( mymap );

mymap.on('locationerror', function(e){
  mymap.setView([39.74950, -104.95093], 4);
});
