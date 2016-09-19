var mymap = L.map('mapid');
var url = '/locations?q=';

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

    mymap.on("viewreset", reset);

    /***** Helper Functions *****/

    function reset() {
      // put markers at the correct position
      g.selectAll('circle')
        .attr("transform", function(d) {
          var p = mymap.latLngToLayerPoint(d.LatLng);
          return "translate(" + p.x + "," + p.y + ")";
        })
        .attr("r", resize);
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
      div.transition()
        .duration(500)
        .style("opacity", 0.9);
      div.html(d.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

  });
}