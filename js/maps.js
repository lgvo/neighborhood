(function () {
    // module variables
    var map,
        placesService,
        neightborhood,
        canvas = document.getElementById("map-canvas");

    // module singleton
    var module = Object.create(main);
    module.name = 'maps';
    module.init = function () {
        module.addJS('https://maps.googleapis.com/maps/api/js?v=3.16&callback=main.maps.start&libraries=places');
    };
    module.start = function () {
        neightborhood = new google.maps.LatLng(40.790278, -73.959722);
        map = new google.maps.Map(canvas, {zoom: 14, center: neightborhood});
        setTimeout(3000, module.publish('mapLoaded', 'ok'));
    };
    module.subscribe('newPlace', function (place) {
        place.marker.setMap(map);
        //google.maps.event.addListener(place.marker, 'click', function() {
        //    place.infoWindow.open(map, place.marker);
        //});
    });
    module.subscribe('mapLoaded', function() {
        placesService = new google.maps.places.PlacesService(map);
        placesService.nearbySearch({location: neightborhood, radius: 500}, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var interval = setInterval(function() {
                    if (results.length > 0) {
                        module.publish('newPlace', new Place(results.pop()));
                    } else {
                        clearInterval(interval);
                        module.publish('placesInPlace', 'ok');
                    }
                }, 200);
            } else {
                console.log(status);
            }
        });
    });

    var Place = function (place) {
        this.name = place.name;
        this.location = place.geometry.location;
        this.marker = new google.maps.Marker({
            title: place.name,
            place: {
                placeId: place.id,
                location: place.geometry.location
            },
            animation: google.maps.Animation.DROP
        });
        this.infoWindow = new google.maps.InfoWindow();
        this.infoWindow.setContent(this.name);
    };
    main.register('maps', module);
})();