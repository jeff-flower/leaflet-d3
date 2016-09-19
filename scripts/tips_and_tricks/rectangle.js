var mymap = L.map('mapid');

mymap.options.minZoom = 4;
mymap.setView([-41.2858, 174.7868], 13);

// add tile layer to map
L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a','b','c']
}).addTo( mymap );

mymap.on('locationerror', function(e){
  mymap.setView([39.74950, -104.95093], 4);
});

// Add svg element for d3 to use
var svg = d3.select(mymap.getPanes().overlayPane).append("svg");
var g   = svg.append("g").attr("class", "leaflet-zoom-hide");
var bounds = null;

d3.json("json/rectangle.json", function(geoShape) {
  // convert GeoJSON to SVG
  // transform a lat and longitude to a pixel value
  var transform = d3.geoTransform({point: projectPoint});
  // transform a GeoJSON map to a pixel values
  var path = d3.geoPath().projection(transform);

  // create path elements for each of the features
  d3_features = g.selectAll("path")
    .data(geoShape.features)
    .enter().append("path");

  // Leaflet map has viewreset event when a zoom or pan occurs
  mymap.on("viewreset", reset);

  reset();

  // fit the SVG element to leaflet's map layer
  function reset() {

    // d3 has bounds function to give the rectangluar bounds of a path
    bounds = path.bounds(geoShape);

    var topLeft = bounds[0],
	bottomRight = bounds[1];

    svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + ","
	    + -topLeft[1] + ")");

    // initialize the path data
    d3_features.attr("d", path)
      .style("fill-opacity", 0.7)
      .attr('fill','blue');
  }

});

// d3 projection function
function projectPoint(x, y) {
  // Leaflet map has function for converting lat and longitude to a pixel value
  var point = mymap.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}

