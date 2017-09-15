import template from './new-sermon.html';
import popoverTemplate from './popover.html';

import { isEmpty } from 'lodash';

import { toLocalDate, toUtcMilliseconds } from '../../../common/helper';

import * as moment from 'moment';
import { default as swal } from 'sweetalert2';

const PRIVATE_OPTIONS = [{
        key: 'Public',
        value: 'Everyone',
        info: 'Anyone on ScripturedIn'
    },
    {
        key: 'Members',
        value: 'Church Members',
        info: 'Only my church members'
    }
];


class Controller {

    constructor(bibleService, alertService, $state, $stateParams, $sce,
        $scope, $compile, $timeout) {
        this.bibleService = bibleService;
        this.alertService = alertService;
        this.state_ = $state;
        this.stateParams_ = $stateParams;
        this.sce_ = $sce;
        this.scope_ = $scope;
        this.compile_ = $compile;
        this.timeout_ = $timeout;
    }

    $onInit() {
        this.MODULE_CONFIG = {
            toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                ['image']
            ]

        };
        this.sermonContent = {
            summary: false,
            notes: true,
            questions: false
        };

        this.errors = {};
        this.noteStyle = 'point';
        this.privacy = PRIVATE_OPTIONS;
        this.date_ = this.stateParams_.date ? moment.unix(this.stateParams_.date).toDate() : new Date();
        this.date_.setHours(0);
        this.date_.setMinutes(0);

        this.sermon = {
            scriptures: [],
            _dates: [{ 'date': this.date_ }],
            title: '',
            notes: [{ content: '' }],
            questions: [{ content: '' }],
            privacy: 'Public'
        };
        console.log('sermon >>', this.sermon);
    }

    /**
     * Save sermon to database. Saved sermon is not published.
     */
    save() {
        this.submitted = true;
        console.log(this.sermon);
        if (this.validateSermon()) {
            this.bibleService.saveSermon(this.sermon).then(resp => {
                resp = resp.data;
                if (resp.id) {
                    this.alertService.info('Sermon saved');
                    //map scripture object to string
                    resp.scriptures = resp.scripture.map(s => {
                        var tmp = s.book + ' ' + s.chapter;
                        if (isEmpty(s.verses)) {
                            tmp += ':' + s.verses.join(',');
                        }
                        return tmp;
                    });
                    //map the date ms to date objects
                    resp._dates = resp.date.map(d => {
                        return { date: toLocalDate(d) };
                    });
                    if (isEmpty(resp.questions)) {
                        resp.questions = [{ content: '' }];
                    }
                    this.sermon = resp;
                    console.log('sermon', this.sermon);

                    //this.util.log(this.sermon);

                } else if (resp.status == 'error') {
                    this.alertService.error(resp.message.join('<br>'));
                }

            });
        } else {
            this.alertService.error('Some required fields are missing');
        }
    };

    /**
     * Publish a sermon so it's available to users
     */
    publish() {
        this.submitted = true;
        var colors = [
            'bgm-teal',
            'bgm-red',
            'bgm-pink',
            'bgm-blue',
            'bgm-lime',
            'bgm-green',
            'bgm-cyan',
            'bgm-orange',
            'bgm-purple',
            'bgm-gray',
            'bgm-black'
        ];

        //console.log(this.sermon);
        if (this.validateSermon()) {
            this.sermon.cal_color = _.sample(colors);
            this.bibleService.publishSermon(this.sermon).then(resp => {
                resp = resp.data;
                if (resp.id) {
                    swal({
                        title: resp.title + ' has been published.',
                        text: 'Do you want to create another sermon?',
                        type: 'success',
                        showCancelButton: true,
                        cancelButtonText: 'Yes!',
                        confirmButtonColor: '#DD6B55',
                        confirmButtonText: 'No, go to calender!',
                        closeOnConfirm: true
                    }, goToCalendar => {
                        if (!goToCalendar) {
                            this.submitted = false;
                            this.sermon = {
                                scriptures: [],
                                _dates: [{ 'date': this.date_ }],
                                title: '',
                                notes: [{ content: '' }],
                                questions: [{ content: '' }]
                            };
                        } else {
                            this.state_.go('base.sermon-browse');
                        }
                    });

                } else if (resp.status == 'error') {
                    this.alertService.error(resp.message.join('<br>'));
                }

            });

        }
    };


    /**
     * Function gets called when a new scripture is added. The scripture text is parsed and null is returned
     * if the text isn't a valid scripture to avoid adding it.
     * @param chip
     * @returns {null}
     */
    onScriptureAdd(chip) {
        if (isEmpty((this.bibleService.parseScripture(chip)))) {
            return null;
        }
    };

    validateSermon() {
        if (!isEmpty(this.sermon.title) && this.sermon.scriptures.length > 0) {

            if (isEmpty(this.sermon.note) && isEmpty(this.sermon.notes[0].content)) {
                this.selectedTab = 1;
                return false;
            }
            //create scripture objects
            this.sermon.scripture = this.sermon.scriptures.map(text => {
                return this.bibleService.parseScripture(text);
            });
            //convert date object1s to utc millisecs
            this.sermon.date = this.sermon._dates.map(dt => {
                return toUtcMilliseconds(dt.date);
            });
            return true;
        }
        return false;
    };

    addDate() {
        var d = angular.copy(this.date_);
        d.setHours(0);
        d.setMinutes(0);
        this.sermon._dates.push({ date: d });
    };
}

export const NewSermonComponent = {
    template,
    controller: Controller
};