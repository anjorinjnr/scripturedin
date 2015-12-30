App.service('alertService', function () {
    var self = this;

    var config = {
        enter: 'animated fadeIn',
        exit: '',
        from: 'top',
        align: 'right',
        delay: 4000,
        icon: ''
    };
    self.info = function (message) {
        notify(message, 'inverse')
    };
    self.danger = function (message) {
        notify(message, 'danger')
    };
    function notify(message, type) {
        $.growl({
            icon: config.icon,
            title: '',
            message: message,
            url: ''
        }, {
            element: 'body',
            type: type,
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