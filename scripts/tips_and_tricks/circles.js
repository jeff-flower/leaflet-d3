// NOTE: This code works with Leaflet v0.7, but not 1.0

var map = L.map('mapid').setView([-41.2858, 174.7868], 13);
var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);

// Initialize the SVG layer
// _initPathRoot is prototype method of map object in Leaflet
map._initPathRoot()

// We pick up the SVG from the map object
var svg = d3.select("#mapid").select("svg"),
    g = svg.append("g");

d3.json("json/circles.json", function(collection) {
  // Add a LatLng object to each item in the dataset
  collection.objects.forEach(function(d) {
    d.LatLng = new L.LatLng(d.circle.coordinates[0],
                            d.circle.coordinates[1])
  })

  var feature = g.selectAll("circle")
      .data(collection.objects)
      .enter().append("circle")
      .style("stroke", "black")
      .style("opacity", .6)
      .style("fill", "red")
      .attr("r", 20);

  // viewreset is map leaflet map event that fires when map is zoomed or panned
  // need to hook in to this event so we can resize the svg element as needed
  map.on("viewreset", update);
  update();

  function update() {
    // feature is the group of svg circles we added earlier
    feature.attr("transform",
                 function(d) {
                   return "translate("+
                     // latLngToLayerPoint is method of leaflet map object that converts
                     // a lat and longitude to pixel values in the current view
                     // the circle sizes will remain the same no matter the zoom level
                     // but they will be re-positioned to handle the zoom/pan
                     map.latLngToLayerPoint(d.LatLng).x +","+
                     map.latLngToLayerPoint(d.LatLng).y +")";
                 }
                )
  }
})
