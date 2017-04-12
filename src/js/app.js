/* Load Google Map */

var map;

function initMap() {
    // Constructor creates a new map - only center and zoon are required.
    map = new google.maps.Map(document.getElementById('map'), { // which element to use to display map
        center: {
            lat: 30.3071816, //Austin, TX
            lng: -97.7559964
        }, // location of the map to be centered
        zoom: 13
    });

    // Location of Bullock Texas State History Museum
    var txStateMuseum = {lat: 30.280365, lng: -97.739174};

    // Create new instance of map marker for state museum
    var marker = new google.maps.Marker({
        position: txStateMuseum,
        map: map,
        title: 'Texas State Museum'
    });

    // Add context to the map marker
    var infowindow = new google.maps.InfoWindow ({
        content: 'Have you ever been to the state museum?'
    });

    // Open the info window when we click on the marker
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
}
