(function () {
    var iconsBase = '';
    var icons = {
        restaurant: iconsBase,
        cafe: iconsBase
    };


    var module = Object.create(main);
    module.name = 'view';
    module.init = function () {

    };

    module.subscribe('placesInPlace', function() {
        document.getElementById("places-search").style.display = 'block';
        console.log(this.name + ' << mapLoaded')
    });

    main.register('view', module);
})();
