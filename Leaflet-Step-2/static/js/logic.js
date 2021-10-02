// Colors of markers
var myColors = ['#ecffb3', '#99cc00', '#ffcc00', ' #ff9900', '#cc0000', '#33001a'];

// Store the API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var queryUrlPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  d3.json(queryUrlPlates).then(function (plates) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features, plates.features);
  });
});

function createFeatures(earthquakeData, platesData) {

  function markerSize(mag) {
    return (mag) * 5;
  }

  function marker(feature, latlng) {
    var col;
    var colFill;
    var dep = feature.geometry.coordinates[2];
    if (dep < 10) {
      colFill = myColors[0]
    }
    else if (dep < 30) {
      colFill = myColors[1]
    }
    else if (dep < 50) {
      colFill = myColors[2]
    }
    else if (dep < 70) {
      colFill = myColors[3]
    }
    else if (dep < 90) {
      colFill = myColors[4]
    }
    else {
      colFill = myColors[5]
    }
    return new L.CircleMarker(latlng, {
      fillOpacity: 0.75,
      color: '#555',
      weight: 1,
      fillColor: colFill,

      radius: markerSize(feature.properties.mag)
    });
  }


  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}<br>Magnitude: ${(feature.properties.mag)}
    </p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: marker
  });

  var plate = boundaries(platesData);

  // Send  earthquakes and plates  layer to the createMap function/
  createMap(earthquakes, plate);
}


function createMap(earthquakes, plate) {

  // Create the base layers

  var street_s = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 512,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
  });

  var mapBox_sat = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 512,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var mapBox_light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 512,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var mapBox_out = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    tileSize: 512,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Satellite": mapBox_sat,
    "Light": mapBox_light,
    "Outdoor": mapBox_out,
    "Street - Satellite": street_s
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": plate,
    "Greetings ": sk(),
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [mapBox_sat, earthquakes]
  });

  // Create a layer control
  // Pass it our baseMaps and overlayMaps
  // Add the layer control to the map

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<b>Depth</b><br>";
    div.innerHTML += '<i style="background: ' + myColors[0] + '"></i><span>&lt;10</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[1] + '"></i><span>10-30</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[2] + '"></i><span>30-50</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[3] + '"></i><span>50-70</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[4] + '"></i><span>70-90</span><br>';
    div.innerHTML += '<i style="background: ' + myColors[5] + '"></i><span>&gt;90</span><br>';
    return div;
  };

  legend.addTo(myMap);
}

// greetings
function sk() {
  var del = [[-1, 2], [-2, 0], [-1, -2], [0, -2], [4, -3], [4, 3], [0, 2], [-1, 2], [-2, 0], [-1, -2]];
  x = 19; y = 50;
  var os = [];
  for (i = 0; i < del.length; i++) {
    os.push([y += del[i][1], x += del[i][0]])
  }
  return L.layerGroup([L.polygon(os, { color: 'red' })]);
};

// creating plates boundaries
function boundaries(platesData) {
  allPlates = []
  for (var i = 0; i < platesData.length; i++) {
    var plate = platesData[i];
    var coordFlip = [];
    coordinates = plate.geometry.coordinates;
    for (j = 0; j < coordinates.length; j++) {
      coordFlip.push([coordinates[j][1], coordinates[j][0]]);
    }
    allPlates.push(
      L.polyline(coordFlip)
    )
  }
  return L.layerGroup(allPlates);
};
