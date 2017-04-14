/* Load Google Map */

var map;

// Create array for all markers
var markers = [];

// Create a styles array to use with the map
var style = [
    {
        featureType: 'water',
        stylers: [
            {color: '#19a0d8'}
        ]
    },{
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
            {color: '#ffffff'},
            {weight: 6}
        ]
    },{
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
            {color: '#e85113'}
        ]
    },{
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            {color: '#efe9e4'},
            {lightness: -40}
        ]
    },{
        featureType: 'transit.station',
        stylers: [
          { weight: 9 },
          { hue: '#e85113' }
        ]
      },{
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
          { visibility: 'off' }
        ]
      },{
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [
          { lightness: 100 }
        ]
      },{
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          { lightness: -100 }
        ]
      },{
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          { visibility: 'on' },
          { color: '#f0e4d3' }
        ]
      },{
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#efe9e4' },
          { lightness: -25 }
        ]
      }
];

function initMap() {
    // Constructor creates a new map - only center and zoon are required.
    map = new google.maps.Map(document.getElementById('map'), { // which element to use to display map
        center: {
            lat: 30.3071816, //Austin, TX
            lng: -97.7559964
        }, // location of the map to be centered
        zoom: 13,
        styles: style,
        mapTypeControl: false // disable user ability to change map type
    });

    // Add several locations to our map in an array
    var locations = [
        {title: 'North Loop', location: {lat: 30.318867, lng: -97.718588}},
        {title: 'Central Austin', location: {lat: 30.296171, lng: -97.738954}},
        {title: 'Downtown Austin', location: {lat: 30.272921 , lng: -97.744386}},
        {title: 'East Austin', location: {lat: 30.274415, lng: -97.715923}},
        {title: 'South Lamar', location: {lat: 30.236265, lng: -97.782422}}
    ];

    // To hold data in info window for marker
    var largeInfoWindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
   // Create a "highlighted location" marker color for when the user
   // mouses over the marker.
   var highlightedIcon = makeMarkerIcon('ffff24');

    for (var i = 0; i < locations.length; i++){
        // Get the position and title of the location array
        var position = locations[i].location;
        var title = locations[i].title;
        //Create a maker per position, and put markers into array
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: i
        });

        // Push the markers to the array of markers
        markers.push(marker);

        // Create an onclick even to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfoWindow);
        });
        // Two event listeners - one for mouseover, one for mouseout
        // to change the colors back and forth
        marker.addListener('mouseover', function(){
          this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function(){
          this.setIcon(defaultIcon);
        });

    }

    // When clicked, run appropriate function to show or hide listings
    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);
}


// This function populuates the infowindow when a marker is clicked
// Only one infowindow will open at a time.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened at this marker.
    if(infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '<br>' + marker.position + '</div>');
        infowindow.open(map, marker);
        //Make sure the marker property is closed if the infowindow is closed.
        infowindow.addListener('closeclick', function(){
            infowindow.setMarker(null);
        });
    }
}


function showListings() {
    // In case our markers move outside boundaries of original maps location
    var bounds = new google.maps.LatLngBounds();
    // Loop through all of the locations
    for(var i = 0; i < markers.length; i++){
        markers[i].setMap(map); // now set the map
        // Extend the boundaries of the map each marker
        bounds.extend(markers[i].position);
    }
    // Fit map to bounds
    map.fitBounds(bounds);
}

function hideListings() {
    // hide all the markers
    for(var i = 0; markers.length; i++) {
        markers[i].setMap(null);
    }
}

// This function takes in a COLOR, and then creates a new marker icon
// of that color.  The icon will be 21 px wide and 34 high, have an origin
// of 0,0 and be anchored at 10,34
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}
