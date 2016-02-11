///**
// * Created by ebby on 12/29/2015.
// */
//describe('SermonController', function () {
//    var sermonCtrl, $httpBackend, alertService, authService, $state, $controller;
//
//    beforeEach(module('scripturedIn'));
//    beforeEach(inject(function ($injector, _bibleService_, $controller) {
//
//        $httpBackend = $injector.get('$httpBackend');
//        alertService = {
//            info: function () {
//
//            }
//        };
//        authService = {};
//        $state = { current: {name: ''}};
//        $controller = $controller;
//        sermonCtrl = $controller('sermonController', {
//            'alertService': alertService,
//            '$state': $state,
//            'authService': authService,
//            'sermons': [],
//            'sermon': {}
//        });
//    }));
//
//    describe('save', function () {
//
//        it('should save sermon, alert user and update sermon property', function () {
//
//            $state.current = {
//                'name': 'base.sermon-create'
//            };
//            //sermonCtrl = $controller('sermonController', {
//            //    'alertService': alertService,
//            //    '$state': $state,
//            //    'authService': authService,
//            //    'sermons': [],
//            //    'sermon': {}
//            //});
//
//            spyOn(alertService, 'info');
//
//            var d = moment();
//            sermonCtrl.sermon = {
//                title: 'foo bar',
//                scriptures: ['John 3:16'],
//                _dates: [{'date': d.toDate()}],
//                notes: [
//                    {
//                        content: 'some content'
//                    }
//                ],
//                questions: [
//                    {
//                        content: ''
//                    }
//                ]
//            };
//
//
//            var resp = {
//                "id": 5681726336532480,
//                "modified_at": 1451435711135,
//                "pastor": {
//                    "id": 5733953138851840,
//                    "updated": 1451347244079.0,
//                    "profile_info": null,
//                    "first_name": "Tola",
//                    "email": "tola.anjorin@gmail.com",
//                    "created": 1451320486089.0,
//                    "gender": "m",
//                    "last_name": "Anjorin Jnr",
//                    "is_pastor": true,
//                    "verified": true,
//                    "church_key": 6219937278328832
//                },
//                "date": [d.utc().unix() * 1000],
//                "notes": [{"content": "This is the note"}],
//                "scripture": [{"chapter": 3, "book": "John", "verses": ["16"]}],
//                "title": "foo bar",
//                "created_by": null,
//                "note": null,
//                "publish": false,
//                "pastor_key": 5733953138851840,
//                "questions": []
//            };
//            $httpBackend.expectPOST('/api/sermon').respond(200, resp);
//            sermonCtrl.save();
//            $httpBackend.flush();
//
//            expect(sermonCtrl.sermon.id).toBe(resp.id);
//            expect(_.isDate(sermonCtrl.sermon._dates[0].date)).toBeTrue
//            expect(sermonCtrl.sermon.questions).toEqual(jasmine.arrayContaining([{content: ''}]));
//            expect(sermonCtrl.sermon.scriptures).toEqual(jasmine.arrayContaining(['John 3:16']));
//            expect(alertService.info).toHaveBeenCalledWith('Sermon saved');
//
//        });
//
//
//    });
//
//});