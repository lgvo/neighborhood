(function () {
    var module = Object.create(main);
    module.name = 'model';
    module.init = function () {

    };

    module.subscribe('placesInPlace', function() {
        document.getElementById("places-search").style.display = 'block';
        console.log(this.name + ' << mapLoaded')
    });

    main.register('model', module);
})();
