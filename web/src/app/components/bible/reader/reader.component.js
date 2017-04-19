import template from './reader.html';

class ReaderController {

    constructor(bibleService) {
        this.bibleService = bibleService;
    }

    $onInit() {
        console.log('text', this.scriptureText)
        this.scripture_ = this.bibleService.parseScripture(this.scriptureText);
        this.getPassage(this.scripture_);
        this.getVersions();
    }

    getVersions() {
        this.bibleService.versions().then(resp => {
            this.versions = resp.data;
        });
    }

    /**
     * Reload scripture using selected translation
     * @param {Object} trans
     */
    changeTranslation(trans) {
        this.scripture_.translation = trans.abbr.toLowerCase();
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
        });
    }
}

export const BibleReaderComponent = {
    template,
    bindings: {
        scriptureText: '<'
    },
    controller: ReaderController
};