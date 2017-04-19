import template from './fabmenu.html';
import addSvg from '../../../assets/img/icons/add.svg';
import createSvg from '../../../assets/img/icons/create.svg';
import addNoteSvg from '../../../assets/img/icons/note_add.svg';
import { books } from '../data/bible-books';

class Controller {
    constructor() {

    }

    $onInit() {
        this.addSvg = addSvg;
        this.createSvg = createSvg;
        this.addNoteSvg = addNoteSvg;
        this.books = books;
        console.log(this.books);
    }
}
export const FabMenuComponent = {
    template,
    controller: Controller
};