import template from './find-sermon.html';


class Controller {

    constructor() {

    }

    $onInit() {
        this.layout = 'calendar';
    }
}

export const FindSermonComponent = {
    template,
    controller: Controller
};