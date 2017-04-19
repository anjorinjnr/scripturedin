import template from './content.html';
import addSvg from '../../../assets/img/icons/add.svg';
import createSvg from '../../../assets/img/icons/create.svg';
import addNoteSvg from '../../../assets/img/icons/note_add.svg';


//let img = require('svg-url!../../../assets/img/icons/add.svg');
//console.log('>>', img);
class Controller {
    constructor() {

    }

    $onInit() {
        this.addSvg = addSvg;
        this.createSvg = createSvg;
        this.addNoteSvg = addNoteSvg;

    }
}
export const ContentComponent = {
    template,
    controller: Controller
};