/* Load Google Map */

var map;

function initMap() {
    // Constructor creates a new map - only center and zoon are required.
    map = new google.maps.Map(document.getElementById('map'), { // which element to use to display map
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        }, // location of the map to be centered
        zoom: 13
    });
}
