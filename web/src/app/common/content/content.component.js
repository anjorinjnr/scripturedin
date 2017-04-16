import template from './content.html';
import addImg from '../../../assets/img/icons/add.svg';
//let img = require('svg-url!../../../assets/img/icons/add.svg');
//console.log('>>', img);
class Controller {
    constructor() {
        this.addImg = addImg;
    }

    $onInit() {
        this.addImg = addImg;

    }
}
export const ContentComponent = {
    template,
    controller: Controller
};