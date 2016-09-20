var mymap = L.map('mapid');
var url = '/locations?q=';
var mapCenter = null; // store the center of the map as leaflet LatLng object for calculating distance moved when dragging
var centerOffset = {x: 0, y: 0};

var circleOpacity = 0.6;
var circleHoverOpacity = 0.8;

mymap.options.minZoom = 4;
mymap.setView([39.74950, -104.95093], 11);

// add tile layer to map
L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a','b','c']
}).addTo( mymap );

// initialize svg layer
mymap._initPathRoot();

// Add svg element for d3 to use
var svg = d3.select("#mapid").select("svg");
var g   = svg.append("g");

// Add tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.select("#queryButton").on("click", queryAndPlace);

function queryAndPlace(){
  var target = getLocation();
  placeMarkers(target);
}

function getLocation() {
  return url + $('#locationSearch').val();
}

function centerMap(center){
  mymap.setView([ center[0], center[1] ], 11)
}

function placeMarkers(url) {
  d3.json(url, function(data) {
    var locations = data.locations;

    for(var i = 0; i < locations.length; i++){
      // grab coordinates
      var coordinates = locations[i].coordinates;
      // add Leaflet lat/lng object so we can map it
      locations[i].LatLng = new L.LatLng(coordinates[0], coordinates[1]);
    }

    // create atm marker circles
    var feature = g.selectAll('circle').data(locations);

    // remove exiting nodes
    feature.exit().remove();

    // style entering nodes
    feature.enter().append('circle')
      .style("stroke", "black")
      .style("opacity", circleOpacity)
      .style("fill", "red")
      .on("mouseover", circleHover)
      .on("mouseout", circleLeave)
      .on("click", showTooltip)
      .attr("r", resize);

    // center map to new location
    centerMap(data.center);
    // call reset to position markers
    reset();

    mymap.on("viewreset", resetView);
    mymap.on("dragstart", function(e){
      mapCenter = mymap.getCenter();
    });
    mymap.on("dragend", function(){
      // get old map center as pixels
      var oldCenter = mymap.latLngToLayerPoint(mapCenter);

      // update global variable mapCenter
      mapCenter = mymap.getCenter();

      // get new map center as pixels
      var newCenter = mymap.latLngToLayerPoint(mapCenter);

      // calculate amount moved
      var xDiff = oldCenter.x - newCenter.x;
      var yDiff = oldCenter.y - newCenter.y;

      // update offsetCenter
      centerOffset.x = centerOffset.x + xDiff;
      centerOffset.y = centerOffset.y + yDiff;

      // update tooltip location
      resetTooltip();
    });

    /***** Helper Functions *****/

    function resetView(){
      // on view reset need to update the position of each circle
      // and the position of the tooltip
      reset();
      resetTooltip();
    }

    function reset() {
      // put markers at the correct position
      g.selectAll('circle')
        .attr("transform", function(d) {
          var p = mymap.latLngToLayerPoint(d.LatLng);
          return "translate(" + p.x + "," + p.y + ")";
        })
        .attr("r", resize);
    }

    function resetTooltip() {
      div.style("left", function(tooltipData){
        var p = mymap.latLngToLayerPoint(tooltipData.LatLng);
        var newLeft = p.x + centerOffset.x;
        return newLeft + "px";
      })
        .style("top", function(tooltipData){
          var p = mymap.latLngToLayerPoint(tooltipData.LatLng);
          var newTop = p.y + centerOffset.y;
          return newTop + "px";
        });
    }

    function resize(d) {
      return mymap.getZoom();
    }

    function circleHover(d) {
      var circle = d3.select(this);
      var radius = parseInt(circle.attr("r")) + 10;

      circle.transition()
        .duration(500)
        .attr("r", radius)
        .style("opacity", circleHoverOpacity);
    }

    function circleLeave(d) {
      d3.select(this).transition()
        .duration(300)
        .attr("r", resize)
        .style("opacity", circleOpacity);
    }

    function showTooltip(d) {
      // d is the data from the circle object that was clicked
      // we want to use the LatLng object from the circle to locate the
      // the tooltip

      var location = d.LatLng;

      div.transition()
        .duration(500)
        .style("opacity", 0.9);

      div.data([{LatLng: location}])
        .html(d.name)
        .style("left", function(tooltipData){
          var p = mymap.latLngToLayerPoint(tooltipData.LatLng);
          return p.x + "px";
        })
        .style("top", function(tooltipData){
          var p = mymap.latLngToLayerPoint(tooltipData.LatLng);
          return p.y + "px";
        });
    }

  });
}
