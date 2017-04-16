import $ from 'jquery';
import '../../../bower_components/remarkable-bootstrap-notify/bootstrap-notify';

export class AlertService {

    constructor() {
        this.config = {
            delay: 40000,
            type: 'info'
        };
    }
    error(message) {
        let config = {
            type: 'danger',
            delay: 20000
        };
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        this.notify(message, config);
    };

    info(message) {
        if (_.isArray(message)) {
            message = message.join('<br>');
        }
        this.notify(message, this.config);
    };

    notify(message, config) {
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

}