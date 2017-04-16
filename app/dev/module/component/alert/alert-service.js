App.service('alertService', function ($mdToast) {
    var self = this;
    var _config = {
        delay: 400000,
        type: 'info'
    };
    self.info = function (message, config) {
        var c = _.merge(_config, config);
        c.type = 'info';
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        self.notify(message, c);
    };
    self.danger = function (message, config) {
        var c = _.merge(_config, config);
        c.type = 'danger';
        c.delay = 20000;
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        self.notify(message, c)
    };
    self.notify = function (message, config) {
        $.notifyClose();
        $.notify({
            message: message
        }, {
            // settings
            offset: {
                x: 20,
                y: 100
            },
            type: config.type,
            delay: config.delay
        });

    }
});