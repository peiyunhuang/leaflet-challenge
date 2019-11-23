//Create a LayerGroup for Earthquakes
let earthquakes = new L.LayerGroup();

//Create Variables to Reference Two Tile Layers
let OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let baseMaps = {
    "Open Map": OpenTopoMap,
    "Esri Map": Esri_WorldImagery
};

//Create a Map to Display the Layers for the Open Map and Earthquakes
let myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 4,
    layers: [OpenTopoMap, earthquakes]
});

//Add the Layers of baseMaps to the Map with Control
L.control.layers(baseMaps).addTo(myMap);

//URL for the GeoJSON Data of the Site of the USGS
let geoJSONUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

//Use D3.js to Make the GeoJSON Call to the Site of the USGS
d3.json(geoJSONUrl, function(geoJSONData) {
    
    //Create a Function to Determine Size of a Marker as a Function of the Magnitude of an Earthquake
    function magnitudeSize(magnitude) {
        switch (true) {
            case magnitude > 5:
                return 30;
            case magnitude > 4:
                return 24;
            case magnitude > 3:
                return 18;
            case magnitude > 2:
                return 12;
            case magnitude > 1:
                return 6;
            default:
                return 3;
        }
    }
    //Create a Function to Determine the Color of a Marker as a Function of the Magnitude of an Earthquake
    function magnitudeColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "DarkRed";
        case magnitude > 4:
            return "DarkOrange";
        case magnitude > 3:
            return "Gold";
        case magnitude > 2:
            return "Green";
        case magnitude > 1:
            return "LightGreen";
        default:
            return "White";
        }
    }
    //Create a Function to Determine the Style of a Marker as a Function of the Magnitude of an Earthquake
    function markerStyle(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: magnitudeColor(feature.properties.mag),
          color: "#000000",
          radius: magnitudeSize(feature.properties.mag),
          stroke: true,
          weight: 0.75
        };
    }
    //Create a Layer for the GeoJSON Data to Contain the Array of Features
    L.geoJSON(geoJSONData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: markerStyle,
        //Bind a Popup for the Location, Date/Time, and Magnitude of an Earthquake
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place +
            "</h4><hr><p>Date/Time: " + new Date(feature.properties.time) +
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    //Add the GeoJSON Data to the LayerGroup for Earthquakes
    }).addTo(earthquakes);
    
    //Add the LayerGroup for Earthquakes to the Map
    earthquakes.addTo(myMap);
    
    //Create the Legend for the Map
    let legend = L.control({ position: "bottomleft" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"),
        magnitudeLevels = [0, 1, 2, 3, 4, 5];
        div.innerHTML += "<h3>Magnitude</h3>"
        for (let i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + magnitudeColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    //Add the Legend to the Map
    legend.addTo(myMap);
});