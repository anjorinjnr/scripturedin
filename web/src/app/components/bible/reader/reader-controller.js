import {isEmpty} from 'lodash';

/**
 * Loads the input scripture from the server and renders in the view.
 * Handles all the interactions for the views that displays the scripture.
 */
export class ReaderController {

    constructor(bibleService) {
        this.bibleService = bibleService;
    }

    /**
     * Load the scripture and available versions on init
     */
    $onInit() {
        this.name = 'RC*';
        if (isEmpty(this.scripture)) {
            this.scripture_ = this.bibleService.parseScripture(this.scriptureText);
            this.getPassage(this.scripture_);

        }

        this.getVersions();
    }

    /**
     *  Get all available bible versions
     */
    getVersions() {
        this.bibleService.versions().then(resp => {
            this.versions = resp.data;
        });
    }

    /**
     * Reload scripture for the new selected translation
     * @param {Object} trans
     */
    changeTranslation(translation) {
        this.scripture_.translation = translation.abbr.toLowerCase();
        this.getPassage(this.scripture_);
    };

    /**
     * Load scripture from server
     * @param {Object} scripture
     */
    getPassage(scripture) {
        this.loading = true;
        this.bibleService.getPassage(this.scripture_).then(resp => {
            this.loading = false;
            this.scripture = resp.data;
            console.log('scripture>>', this.scripture);
        });
    }
}