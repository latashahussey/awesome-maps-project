/* Load Google Map */

var map;

// Create array for all markers
var markers = [];

// This global polygon variable is to ensure only one polygon is rendered.
var polygon = null;

// Create a styles array to use with the map
var style = [{
  featureType: 'water',
  stylers: [{
    color: '#19a0d8'
  }]
}, {
  featureType: 'administrative',
  elementType: 'labels.text.stroke',
  stylers: [{
      color: '#ffffff'
    },
    {
      weight: 6
    }
  ]
}, {
  featureType: 'administrative',
  elementType: 'labels.text.fill',
  stylers: [{
    color: '#e85113'
  }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.stroke',
  stylers: [{
      color: '#efe9e4'
    },
    {
      lightness: -40
    }
  ]
}, {
  featureType: 'transit.station',
  stylers: [{
      weight: 9
    },
    {
      hue: '#e85113'
    }
  ]
}, {
  featureType: 'road.highway',
  elementType: 'labels.icon',
  stylers: [{
    visibility: 'off'
  }]
}, {
  featureType: 'water',
  elementType: 'labels.text.stroke',
  stylers: [{
    lightness: 100
  }]
}, {
  featureType: 'water',
  elementType: 'labels.text.fill',
  stylers: [{
    lightness: -100
  }]
}, {
  featureType: 'poi',
  elementType: 'geometry',
  stylers: [{
      visibility: 'on'
    },
    {
      color: '#f0e4d3'
    }
  ]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.fill',
  stylers: [{
      color: '#efe9e4'
    },
    {
      lightness: -25
    }
  ]
}];

/**
 * initMap - This is the main function in our app that drives the entire application.
 * It generates the map and sets the locations
 */
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
  var locations = [{
      title: 'North Loop',
      location: {
        lat: 30.318867,
        lng: -97.718588
      }
    },
    {
      title: 'Central Austin',
      location: {
        lat: 30.296171,
        lng: -97.738954
      }
    },
    {
      title: 'Downtown Austin',
      location: {
        lat: 30.272921,
        lng: -97.744386
      }
    },
    {
      title: 'East Austin',
      location: {
        lat: 30.274415,
        lng: -97.715923
      }
    },
    {
      title: 'South Lamar',
      location: {
        lat: 30.236265,
        lng: -97.782422
      }
    }
  ];

  // To hold data in info window for marker
  var largeInfoWindow = new google.maps.InfoWindow();

  // Initialize the drawing manager
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON, //default drawing mode
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON // only drawing mode
      ]
    }
  });

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('ffff24');

  for (var i = 0; i < locations.length; i++) {
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
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

  }

  // When button is clicked, run appropriate function to show/hide listings
  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);

  // When button is clicked, run appropriate function to display drawing tool
  document.getElementById('toggle-drawing').addEventListener('click', function() {
    toggleDrawing(drawingManager);
  });

  // When button is clicked, run appropriate function to zoom to area
  document.getElementById('zoom-to-area').addEventListener('click', function() {
    zoomToArea();
  });

  // When button is click, run appropriate function to search within commute time via
  // transportation mode
  document.getElementById('search-within-time').addEventListener('click', function() {
    searchWithinTime();
  });

  // Add event listener so that the polygon is captured, call the
  // searchWithinPolygon function.  This will show the markers in the polygon,
  // and hide any outside it.
  drawingManager.addListener('overlaycomplete', function(event) {
    // First, check if there is an existing polygon.
    // If there is, get rid of it and remove the markers
    if (polygon) {
      polygon.setMap(null);
      hideListings();
    }
    // Switching the drawing mode to the HAND (i.e. no longer drawing)
    drawingManager.setDrawingMode(null);
    // Creating a new editable polygon from the overlay.
    polygon = event.overlay;
    polygon.setEditable(true);
    // Searching withing the polygon
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });

}


/**
 * populateInfoWindow - This function populuates the infowindow when a marker is clicked
 * Only one infowindow will open at a time.
 * @param marker Symbol to pin point location on map.
 * @param infowindow InfoWindow to hold content related to map marker.
 */
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened at this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow to give the streetview time to load
    infowindow.setContent('');
    infowindow.marker = marker;
    //Make sure the marker property is closed if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    //Create new instance of StreetView Service
    var streetViewService = new google.maps.StreetViewService();

    // Distance in meters to search from location for StreetView image incase user-defined location
    // does not have one available
    var radius = 50;

    /**
     * getStreetView - This function will grab the street view image for nearby location
     * @param data
     * @param status  Status of API call.
     */
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        // To look at specific location
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: { //  point of view or angle we want to look at
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>No Street View Found</div>');
      }
    }
    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker
    infowindow.open(map, marker);
  }
}

/**
 * showListings - This function displays map markers at predefined locations within the boundaries of
 * the map window
 */
function showListings() {
  // In case our markers move outside boundaries of original maps location
  var bounds = new google.maps.LatLngBounds();
  // Loop through all of the locations
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map); // now set the map
    // Extend the boundaries of the map each marker
    bounds.extend(markers[i].position);
  }
  // Fit map to bounds
  map.fitBounds(bounds);
}

/**
 * hideListings - This function hides all map markers
 */
function hideListings() {
  // hide all the markers
  for (var i = 0;i < markers.length; i++) {
      markers[i].setMap(null);
  }
}

/**
 * makeMarkerIcon - This function takes in a COLOR, and then creates a new marker icon
 * of that color.  The icon will be 21 px wide and 34 high, have an origin
 * of 0,0 and be anchored at 10,34
 * @param markerColor  The color of the map marker.
 */
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}


/**
 * toggleDrawing - This function shows and hides the drawing options.
 * @param drawingManager Tools for drawing on the map
 */
function toggleDrawing(drawingManager) {
  if (drawingManager.map) {
    drawingManager.setMap(null);
    // In case the user drew anything, get rid of the polygon
    if (polygon) {
      polygon.setMap(null);
    }
  } else {
    drawingManager.setMap(map);
  }
}

/**
 * searchWithinPolygon - This function hides all markers outside the polygon,
 * and shows only the ones within it. This is so that the
 * user can specify an exact area of search.
 */
function searchWithinPolygon() {
  for (var i = 0; i < markers.length; i++) {
    if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}

/**
 * zoomToArea - This function takes the input value in the find nearby area text input
 * locates it, then zooms into that area.  This is so that the user can
 * show all listings, then decide to focus on one area of the map.
 */
function zoomToArea() {
  // Initialize geocoder
  var geocoder = new google.maps.Geocoder();
  // Get the address or place that the user entere.
  var address = document.getElementById('zoom-to-area-text').value;
  // Make sure the address isn't blank.
  if (address === '') {
    window.alert('You must enter an area, or address');
  } else {
    // Geocode the address/area entered to get the center. Then, center the map
    // on it and zoon in
    geocoder.geocode({
      address: address,
      componentRestrictions: {
        locality: 'Austin'
      } // keep results within city
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(15);
      } else {
        window.alert('We could not find that location - try entering a more' +
          'specfic place');
      }
    });
  }
}

/**
 * searchWithinTime - This function allows the user to input a desired travel time, in minutes,
 * and a travel mode, and a location -and only shows the listings within that travel time (via the mode)
 * of the location
 */
function searchWithinTime() {
  // Initialize the distance matrix service.
  var distanceMatrixService = new google.maps.DistanceMatrixService();
  var address = document.getElementById('search-within-time-text').value;
  // Check to make sure the place entered isn't blank.
  if (address === '') {
    window.alert('You must enter an address.');
  } else {
    hideListings();
    // Use the distance matrix service to calculate the duration of the
    // routes between all our markers, and the destination address entered
    // by the user. Then put all the origins into an origin matrix.
    var origins = [];
    for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
    }
    var destination = address;
    var mode = document.getElementById('mode').value;
    // Now that both the origins and destination are defined, get all the
    // info for the distances between them.
    distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        window.alert('Error was: ' + status);
      } else {
        displayMarkersWithinTime(response);
      }
    });
  }
}


/**
 * displayMarkersWithinTime - This function will go through each of the results, and
 * if the distance is LESS than the value in the picker, show it on the map
 * @param response The server response.
 */
function displayMarkersWithinTime(response) {
  var maxDuration = document.getElementById('max-duration').value;
  var origins = response.originAddress;
  var destinations = response.destinationAddresses;
  // Parse through the results, and get the distance and duration of each.
  // Because there might be multiple origins and destinations we have a nested loop
  // Then, make sure at least 1 results was found.
  var atLeastOne = false;
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      if (element.status === "OK") {
        // The distance is returned in feet, but the TEXT is in miles. If we wanted to switch
        // the function to show markers within a user-entered DISTANCE, we would need the
        // value for distance, but for now we only need the text.
        var distanceText = element.distance.text;
        // Duration value is given in seconds so we make it MINUTES. We need both the value
        // and the text.
        var duration = element.duration.value / 60;
        var durationText = element.duration.text;
        if (duration <= maxDuration) {
          //the origin [i] should = the markers[i]
          markers[i].setMap(map);
          atLeastOne = true;
          // Create a mini infowindow to open immediately and contain the
          // distance and duration
          var infowindow = new google.maps.InfoWindow({
            content: durationText + ' away, ' + distanceText
          });
          infowindow.open(map, markers[i]);
          // Put this in so that this small window closes if the user clicks
          // the marker, when the big infowindow opens
          markers[i].infowindow = infowindow;
          google.maps.event.addListener(markers[i], 'click', function() {
            this.infowindow.close();
          });
        }
      }
    }
  }
  if (!atLeastOne) {
    window.alert('We could not find any locations within that distance!');
  }
}
