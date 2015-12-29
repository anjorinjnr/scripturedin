/**
 * Created by eanjorin on 12/14/15.
 */
App.controller('sermonController', function ($location, bibleService,
                                             $mdDialog, userService) {
    var self = this;

    self.sermon = {
        scriptures: [],
        dates: [{'date': ''}],
        title: '',
        notes: [
            {
                content: ''
            }
        ],
        questions: [
            {
                content: ''
            }
        ]
    };
    self.errors = {};
    self.publish = function () {
        self.submitted = true;
        console.log(self.sermon);
        if (!_.isEmpty(self.sermon.title) && self.sermon.scriptures.length > 0
            && !_.isEmpty(self.sermon.notes[0].content)) {
            console.log(self.sermon);

        }
    }
});