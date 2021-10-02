// Store the API endpoint as queryUrl.

var myColors=['#ecffb3','#99cc00','#ffcc00',' #ff9900','#cc0000','#33001a'];

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
    return (mag) * 6;
  }

  function marker(feature, latlng) {
    var col;
    var colFill;
    var dep=feature.geometry.coordinates[2];
    if (dep<10) {
     colFill=myColors[0]
    }
    else if (dep<30) {
     colFill=myColors[1]
    }
    else if (dep<50) {
     colFill=myColors[2]
    }
    else if (dep<70) {
     colFill=myColors[3]
    }
    else if (dep<90) {
     colFill=myColors[4]
    }
    else {
     colFill=myColors[5]
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
    pointToLayer : marker
  });

  var plate = boundaries(platesData);

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes, plate);
}

//  when using MapBox
// Creating initial map object mapBox
// var myMAp = L.map("map", {
// center: [45.52, -122.67],
// zoom: 13  
// });

// adding a tile layer (the background map image)
// L.tileLayer("https://api.mapbax.com/style/v1/{id}/tiles/{z}/{x}/{y}?acces_token={accessToken}", {
//   attribution : "&copy; <a href='http://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/',target='_blank>Improve this map</a></strong>,
//   tileSize: 512,
//   maxZoom : 18,
//   zoomOffset: -1,
//   id: "mapbox/streets-v11",
//   accessToken: API_KEY  
// }).addTo(myMap);


function createMap(earthquakes, plate) {

  // Create the base layers.
  //var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 // })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var satelite =   L.tileLayer('https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=qFKAwVVTsPD48kA1clbr', {
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
});

  var  outdoor = L.tileLayer('https://api.maptiler.com/tiles/outdoor/{z}/{x}/{y}.pbf?key=qFKAwVVTsPD48kA1clbr', {
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e"
});

  // Create a baseMaps object.
  var baseMaps = {
    "Outdoor Map": outdoor,
    "Topographic Map": topo,
    "Satelite Map" : satelite
  };

  // Create an overlay object to hold our overlay.
 
    

  var overlayMaps = {
    Earthquakes: earthquakes, 
    "Tectonic Plates": plate,
    "Greetings ": st(),
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satelite, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<b>Depth</b><br>";
    div.innerHTML += '<i style="background: '+myColors[0]+'"></i><span>&lt;10</span><br>';
    div.innerHTML += '<i style="background: '+myColors[1]+'"></i><span>10-30</span><br>';
    div.innerHTML += '<i style="background: '+myColors[2]+'"></i><span>30-50</span><br>';
    div.innerHTML += '<i style="background: '+myColors[3]+'"></i><span>50-70</span><br>';
    div.innerHTML += '<i style="background: '+myColors[4]+'"></i><span>70-90</span><br>';
    div.innerHTML += '<i style="background: '+myColors[5]+'"></i><span>&gt;90</span><br>';
    return div;
  };
  
  legend.addTo(myMap);  
}

  function st() {
    one=[];
      var del=[[-1,2],[-2,0],[-1,-2],[0,-2],[4,-3],[4,3],[0,2],[-1,2],[-2,0],[-1,-2]];
      x=19;y=52;
      var os=[];
      for(i=0;i<del.length;i++) {
        os.push([y+=del[i][1],x+=del[i][0]])
      }
      one.push(L.polygon(os, {color: 'red'}));
      return L.layerGroup(one); 
  };

    
    function boundaries(platesData) {
      allPlates = []
      for (var i = 0; i < platesData.length; i++) {
        var plate = platesData[i];
        var coordFlip=[];
        coordinates=plate.geometry.coordinates;
        for(j=0;j<coordinates.length;j++) {
          coordFlip.push([coordinates[j][1],coordinates[j][0]]);
        }
        allPlates.push(
          L.polyline(coordFlip)
        )}
        return L.layerGroup(allPlates);  
      };
     


  

