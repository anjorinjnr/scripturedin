import template from './post.html';
import { isEmpty } from 'lodash';
import { trim } from '../../../common/helper';

class PostController {
    constructor($ngRedux, $compile, $scope) {
        'ngInject';
        this.store = $ngRedux;
        this.$compile = $compile;
        this.$scope = $scope;
    }
    $onInit() {
        // this.unsubscribe = this.store.connect(this.mapStateToThis, {})(this);
        //console.log(this.post);
        this.processPost();
    }

    _formatContent(content) {
        const l = content.length;
        if (l > 600) {
            // console.log($compile('<a  href ng-click="test()">more</a>')(scope));
            return trim(content, 600) + '...' + '<a  href ng-click="more()">more</a>';
        }
        return content;
    }
    processPost() {
        this.post = Object.assign({}, this.post);
        this.post.showComments = (this.post.comment_count > 5) ? false : true;
        //process display text
        switch (this.post.kind) {
            case 'Sermon':
                this.post.fullText = this.post.displayText = '<h3 class="m-t-5 m-b-5"><a href="#/sermon/' + this.post.id + '">' + this.post.title + '</a></h3> <br>';
                if (isEmpty(this.post.summary)) {
                    if (!isEmpty(this.post.note)) {
                        this.post.displayText += this._formatContent(this.post.note);
                        this.post.fullText += (this.post.note);
                    } else {
                        // sermon not in bullet points.
                        let content = '';
                        for (let i = 0; i < this.post.notes.length; i++) {
                            content += this.post.notes[i].content;
                        }
                        this.post.displayText += this._formatContent(content);
                        this.post.fullText += this.post.note;

                    }
                } else {
                    this.post.displayText += this._formatContent(this.post.summary);
                    this.post.fullText += this.post.summary;
                }
                break;
            case 'Post':
                this.post.displayText = this._formatContent(this.post.content);
                this.post.fullText = this.post.content;
        }
        //console.log('ppp', this.post);
    }


    more() {
        this.post.displayText = this.post.fullText;
    }

    $onDestroy() {
        //  this.unSubscribe();
    }
    mapStateToThis(state) {
        return {};
    }

    edit() {

    }

    liked() {

    }

    like() {

    }

}

export const PostComponent = {
    template,
    bindings: {
        post: '<'
    },
    controller: PostController
};


export const PostModule = angular
    .module('app.post', [])
    .component('post', PostComponent)
    .name;