/**
 * Created by ebby on 12/28/2015.
 */
describe('BibleService test', function () {
    var bibleService;
    beforeEach(module('scripturedIn'));
    beforeEach(inject(function (_bibleService_) {
        // console.log(_bibleService_);
        bibleService = _bibleService_;
    }));

    describe('BibleService', function () {

        it('correctly passes book and chapter only', function () {
            var res = {
                book: 'John',
                chapter: 4,
                verses: []
            };
            expect(bibleService.parseScripture('John 4')).toEqual(res);
        });
        it('correctly passes book with 1 e.g 1 John and chapter', function () {
            var res = {
                book: '1 John',
                chapter: 4,
                verses: []
            };
            expect(bibleService.parseScripture('1 John 4')).toEqual(res);
            res.book = '1John';
            expect(bibleService.parseScripture('1John 4')).toEqual(res);
        });
        it('correctly passes book with book and chapter and single verse ', function () {
            var res = {
                book: 'John',
                chapter: 3,
                verses: ['16']
            };
            expect(bibleService.parseScripture('John 3:16')).toEqual(res);
            expect(bibleService.parseScripture('John3:16')).toEqual(res);
             var res = {
                book: 'John',
                chapter: 3,
                verses: ['1-5', '16']
            };
            expect(bibleService.parseScripture('John 3:1-5,16')).toEqual(res);
        });
         it('failes to pass invalid book', function () {
            var res = {
            };
            expect(bibleService.parseScripture('Wrongbook 4:35')).toEqual(res);

        });
    })

});