(function () {
    // module variables
    var map,
        placesService,
        neightborhood,
        canvas = document.getElementById("map-canvas");

    var module = Object.create(main);
    module.name = 'maps';

    module.init = function () {
        module.addJS('https://maps.googleapis.com/maps/api/js?v=3.9&callback=main.maps.start&libraries=places');
    };

    module.start = function () {
        neightborhood = new google.maps.LatLng(40.777281,-73.961418);
        map = new google.maps.Map(canvas, {zoom: 17, center: neightborhood});
        setTimeout(3000, module.publish('mapLoaded', 'ok'));
    };

    module.subscribe('newPlace', function (place) {
        google.maps.event.addListener(place.marker, 'click', function() {
            place.infoWindow.open(map, place.marker);
        });
    });

    module.subscribe('mapLoaded', function() {
        placesService = new google.maps.places.PlacesService(map);

        var request = {
            location: neightborhood,
            radius: 500,
            types: module.model.getTypes()
        };

        placesService.search(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var interval = setInterval(function() {
                    if (results.length > 0) {
                        var place = new Place(results.pop());
                        module.publish('newPlace', place);
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
        this.marker = new google.maps.Marker({
            title: place.name,
            position: place.geometry.location,
            place: {
                placeId: place.id,
                location: place.geometry.location
            },
            icon: {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(18, 18)
            },
            animation: google.maps.Animation.DROP
        });
        console.log(place.icon);
        this.innerPlace = place;
        this.infoWindow = new google.maps.InfoWindow();
        this.infoWindow.setContent(this.name);
    };

    Place.prototype.setVisible = function(visibility) {
        if (visibility) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
    };

    Place.prototype.isVisible = function() {
        return this.marker.getMap() != undefined && this.marker.getMap() != null;
    };

    main.register('maps', module);
})();