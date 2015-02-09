(function () {

    var defaultTypes = ['meal_takeaway', 'grocery_or_supermarket', 'bar', 'cafe', 'restaurant', 'food'];

    var module = Object.create(main);
    module.name = 'model';
    module.places = [];
    module.types = {};

    module.init = function () {
        module.addJS('http://cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js')
    };

    module.subscribe('newPlace', function (place) {
        module.places.push(place);
        place.innerPlace.types.forEach(function(type) {

            if (!module.types.hasOwnProperty(type)) {
                module.types[type] = true;
            }

            if (defaultTypes.indexOf(type) != -1) {
                place.setVisible(true);
            }

        });
        console.log('model >> newPlace: ' + module.places.length + place);
    });

    module.getTypes = function() {
        return defaultTypes;
    };

    module.filter = function(filter) {
    };

    main.register('model', module);
})();