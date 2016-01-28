App.service('alertService', function () {
    var self = this;

    var _config = {
        enter: 'animated fadeIn',
        exit: '',
        from: 'top',
        align: 'right',
        delay: 4000,
        icon: ''
    };
    self.info = function (message, config) {
        var c = _.merge(_config, config);
        c.type = 'inverse';
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        notify(message, c)
    };
    self.danger = function (message, config) {
        var c = _.merge(_config, config);
        c.type = 'danger';
        notify(message, c)
    };
    function notify(message, config) {
        $.growl({
            icon: config.icon,
            title: '',
            message: message,
            url: ''
        }, {
            element: 'body',
            type: config.type,
            allow_dismiss: true,
            placement: {
                from: config.from,
                align: config.align
            },
            offset: {
                x: 20,
                y: 85
            },
            spacing: 10,
            z_index: 1031,
            delay: config.delay,
            timer: 1000,
            url_target: '_blank',
            mouse_over: false,
            animate: {
                enter: config.enter,
                exit: config.exit
            },
            icon_type: 'class',
            template: '<div data-growl="container" class="alert" role="alert">' +
            '<button type="button" class="close" data-growl="dismiss">' +
            '<span aria-hidden="true">&times;</span>' +
            '<span class="sr-only">Close</span>' +
            '</button>' +
            '<span data-growl="icon"></span>' +
            '<span data-growl="title"></span>' +
            '<span data-growl="message"></span>' +
            '<a href="#" data-growl="url"></a>' +
            '</div>'
        });
    }
});