/* Load Google Map */

var map;

// Create array for all markers
var markers = [];

function initMap() {
    // Constructor creates a new map - only center and zoon are required.
    map = new google.maps.Map(document.getElementById('map'), { // which element to use to display map
        center: {
            lat: 30.3071816, //Austin, TX
            lng: -97.7559964
        }, // location of the map to be centered
        zoom: 12
    });

    // Add several locations to our map in an array
    var locations = [
        {title: 'North Loop', location: {lat: 30.318867, lng: -97.718588}},
        {title: 'Central Austin', location: {lat: 30.296171, lng: -97.738954}},
        {title: 'Downtown Austin', location: {lat: 30.272921 , lng: -97.744386}},
        {title: 'East Austin', location: {lat: 30.274415, lng: -97.715923}},
        {title: 'South Lamar', location: {lat: 30.236265, lng: -97.782422}}
    ];

    var largeInfoWindow = new google.maps.InfoWindow();

    // Loop through all of the locations
    for (var i = 0; i < locations.length; i++){
        // Get the position and title of the location array
        var position = locations[i].location;
        var title = locations[i].title;
        //Create a maker per position, and put markers into array
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the markers to the array of markers
        markers.push(marker);
        // Create an onclick even to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfoWindow);
        });
    }

    // This function populuates the infowindow when a marker is clicked
    // Only one infowindow will open at a time.
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened at this marker.
        if(infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            //Make sure the marker property is closed if the infowindow is closed.
            infowindow.addListener('closeclick', function(){
                infowindow.setMarker(null);
            });
        }
    }
}
