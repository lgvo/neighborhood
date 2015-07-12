/**
 * Main Module
 */
var main = (function () {
    var queues = {};

    var self = {
        name: 'main',
        register: function (name, module) {
            self[name] = module;
        }
    };

    self.subscribe = function (event, callback) {
        if (!queues.hasOwnProperty(event)) {
            queues[event] = [];
        }
        queues[event].push(callback);
    };

    self.publish = function (event, obj) {
        console.log(this.name + ' >> ' + event);
        var subscribers = queues[event];
        subscribers.forEach(function (func) {
            func(obj);
        });
    };

    self.addJS = function (file) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = file;
        document.body.appendChild(script);
    };

    self.addStyle = (function () {
        var h = document.getElementsByTagName('head')[0];
        return function (link) {
            var ss = document.createElement('link');
            ss.rel = 'stylesheet';
            ss.href = link;
            h.appendChild(ss);
        };
    })();

    return self;
})();

/**
 * Google Maps Module
 */
var mapsCallback = (function () {
    // module variables
    var map,
        placesService,
        neightborhood,
        lastSelected,
        canvas = document.getElementById("map-canvas");

    var module = Object.create(main);
    module.name = 'maps';

    module.subscribe('mapLoaded', function() {
        placesService = new google.maps.places.PlacesService(map);

        var request = {
            location: neightborhood,
            radius: 500,
            types: ['meal_takeaway', 'grocery_or_supermarket', 'bar', 'cafe', 'restaurant', 'food']
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
            animation: google.maps.Animation.DROP,
            map: map
        });
        this.innerPlace = place;


        this.infoWindow = new google.maps.InfoWindow();
        this.infoWindow.setContent(this.name);

        var self = this;
        google.maps.event.addListener(this.marker, 'click', function() {
            module.publish('selected', self);
        });
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

    Place.prototype.openWindow = function () {
        this.infoWindow.open(map, this.marker);
    };

    Place.prototype.closeWindow = function() {
        this.infoWindow.close();
    };

    module.subscribe('focus', function(place) {
        if (!place) {
            map.setCenter(neightborhood);
        } else {
            map.setCenter(place.marker.position);
        }
    });

    main.register('maps', module);

    return function () {
        neightborhood = new google.maps.LatLng(40.777281,-73.961418);
        map = new google.maps.Map(canvas, {zoom: 17, center: neightborhood});
        setTimeout(3000, module.publish('mapLoaded', 'ok'));
    };
})();

/**
 * Search Module
 */
(function() {

    var regex = /[,\.\- ]/;
    var indexMap = {};

    var module = Object.create(main);
    module.name = 'maps';

    module.subscribe('newPlace', function (place) {
        var keys = place.marker.title.split(regex);
        for (var i = 0; i< keys.length; i++) {
            var key = keys[i].toLowerCase();
            if (indexMap.hasOwnProperty(key)) {
                var arr = indexMap[key];
                if (arr.indexOf(place) == -1) {
                    arr.push(place);
                }
            } else {
                var arr = [];
                arr.push(place);
                indexMap[key] = arr;
            }
        }
    });

    module.subscribe('search', function(search) {

        if (!search) {
            module.publish('showAll');
            return;
        }

        var keys = search.toLowerCase().split(regex);
        var matches = [];

        var i = 0;
        do {
            if (!indexMap.hasOwnProperty(keys[i])) {
                module.publish('showOnly', []);
                return;
            }

            matches.push(indexMap[keys[i]]);
            i++;
        } while(i < keys.length);

        module.publish('showOnly', matches.reduce(function (last, current) {
            if (last === undefined) {
                return current;
            } else if (last.length === 0) {
                return last;
            }

            var matchs = [];
            matchs.forEach(function(place) {
                if (last.indexOf(place) != -1) {
                    matchs.push(place);
                }
            });

            return matchs;
        }));
    });

})();

/**
 * ViewModel Module
 */
ko.applyBindings((function () {
    var defaultTypes = ['meal_takeaway', 'grocery_or_supermarket', 'bar', 'cafe', 'restaurant', 'food'];

    var module = Object.create(main);
    module.name = 'model';

    var lastSelected;

    var bindings = {
        places: ko.observableArray(),
        query: ko.observable(''),
        search: function() {
            module.publish('search', bindings.query());
        }
    };

    module.subscribe('newPlace', function (place) {
        bindings.places.push({
            name: place.marker.title,
            data: place,
            visible: ko.observable(true),
            hide: function() {
                this.visible(false);
                place.closeWindow();
                place.setVisible(false);
            },
            show: function() {
                this.visible(true);
                place.setVisible(true);
            },
            select: function() {
                module.publish('selected', place);
            }
        });
    });

    function getContent(place) {
        return place.marker.title;
    };

    module.subscribe('selected', function(place) {
        if (lastSelected) {
            lastSelected.closeWindow();
        }

        if (lastSelected !== place) {
            place.infoWindow.setContent(getContent(place));
            place.openWindow();
            lastSelected = place;
            module.publish('focus', place);
        } else {
            module.publish('focus');
        }
    });

    module.subscribe('showOnly', function(list) {
        bindings.places().forEach(function(place) {
            if (list.indexOf(place.data) != -1) {
                place.show();
            } else {
                place.hide();
            }
        });
    });

    module.subscribe('showAll', function() {
        bindings.places().forEach(function(place) {
            place.show();
        });
    });

    module.subscribe('placesInPlace', function() {
        document.getElementById("places-search").style.display = 'block';
        document.getElementById("places-list").style.display = 'block';
        console.log(this.name + ' << mapLoaded')
    });

    main.register('model', module);

    return bindings;
})());

// remove access to the modules
// main = {};
