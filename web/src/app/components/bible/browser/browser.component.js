import template from './browser.html';
import { chunk } from 'lodash';
import { books } from '../../../common/data/bible-books';

class BibleBrowserController {

    constructor($scope, $stateParams, bibleService, $location) {
        this.scope_ = $scope;
        this.params = $stateParams;
        this.bibleService = bibleService;
        this.location_ = $location;
        this.mode = 'BOOKS';


    }

    viewBook(book) {
        console.log('view book');
        this.book = this.bibleService.findBook(book);
        if (!this.book) {
            this.invalidRefGoToBible();
        }
        //display list of verses in the chapter aka book.
        this.mode = 'BOOK';
        this.location_.path(`/bible/${book}`);

    }

    viewAllBooks() {
        //display list of bible books
        this.mode = 'BOOKS';
        this.booksOt = books.OT;
        this.booksNt = books.NT;
        this.books = books.ALL;

        this.scope_.$watch('$ctrl.filter', val => {
            if (val) {
                val = val.toLowerCase();
                let match = this.books.filter(book => book.human.toLowerCase().indexOf(val) >= 0);
                let chunkSize = Math.max(10, Math.ceil(match.length / 3));
                this.filtered = chunk(match, chunkSize);
            }

        });
    }


    $onInit() {
        if (this.params.book) {
            this.viewBook(this.params.book);
        } else {
            this.viewAllBooks();
        }
    }

    invalidRefGoToBible() {
        // swal({
        //     title: "<strong>Oops!</strong>",
        //     text: "It seems you mistyped the book",
        //     type: "info",
        //     html: true,
        //     confirmButtonText: 'Go the Bible'
        // }, () => this.state_.go('bible'));
    };

}

export const BibleBrowserComponent = {
    template,
    controller: BibleBrowserController
};