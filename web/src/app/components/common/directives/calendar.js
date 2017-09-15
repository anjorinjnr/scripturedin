let $ = require('jquery');
console.log('jq', $);
export const calendarDirective = ($compile) => {
    'ngInject';
    return {
        restrict: 'A',
        scope: {
            select: '&',
            actionLinks: '=',
            events: '=',
            eventClick: '='
        },
        link: (scope, element, attrs) => {
            //Generate the Calendar
            console.log('el', element);
            $(element).fullCalendar({
                header: {
                    right: '',
                    center: 'prev, title, next',
                    left: ''
                },

                theme: true, //Do not remove this as it ruin the design
                selectable: true,
                selectHelper: true,
                editable: true,

                //Add Events
                events: scope.events,

                //On Day Select
                select: (start, end, allDay) => {
                    scope.select({
                        start: start,
                        end: end
                    });
                },
                eventMouseover: (calEvent, jsEvent, view) => {
                    console.log(arguments);
                },
                eventClick: (calEvent, jsEvent, view) => {
                    console.log(arguments);
                    scope.eventClick(calEvent, jsEvent, view);
                }
            });

            //Add action links in calendar header
            //  element.find('.fc-toolbar').append($compile(scope.actionLinks)(scope));
        }
    }

}