(function () {
    var module = Object.create(main);
    module.name = 'model';
    module.init = function () {
        module.addJS('http://cdnjs.cloudflare.com/ajax/libs/knockout/3.1.0/knockout-min.js')
    };
    main.register('model', module);
})();