var main = (function () {

    var jsModules = ['js/maps.js', 'js/view.js', 'js/model.js'];
    var cssModules = ['https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css', 'css/main.css'];

    var queues = {};

    var self = {
        name: 'main',
        register: function (name, module) {
            self[name] = module;
            self[name].init();
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

    var onLoad = function () {
        cssModules.forEach(self.addStyle);
        jsModules.forEach(self.addJS);
    };

    if (['loaded', 'interactive', 'complete'].indexOf(document.readyState) != -1) {
        onLoad();
    } else {
        window.onload(onLoad);
    }

    return self;
})();