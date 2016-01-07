/**
 * Created by eanjorin on 12/11/15.
 */
App
    .directive('focus', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.focus();
            }
        }

    })
    .directive('autoSize', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                if (element[0]) {
                    autosize(element);
                }
            }
        }
    })
    .directive('loading', function () {
        return {
            restrict: 'EA',
            scope: {
                loader: '='
            },
            template: '  <div style="text-align: center" ng-if="loader"> ' +
            '<div class="preloader pls-blue"> ' +
            '<svg class="pl-circular" viewBox="25 25 50 50">' +
            '<circle class="plc-path" cx="50" cy="50" r="20"/>' +
            '</svg>' +
            '</div>' +
            '</div>'
        }
    })
    .directive('submitOn', function () {
        return {
            restrict: 'AE',
            link: function (scope, elm, attrs) {
                console.log(attrs.submitOn);
                scope.$on(attrs.submitOn, function () {

                    // We can't trigger submit immediately,
                    // or we get $digest already in progress error :-[ (because ng-submit does an $apply of its own)
                    setTimeout(function () {
                        console.log('submit');
                        elm.trigger('submit');
                    });
                });
            }
        };
    })
    .directive('calAddSermon', function (authService) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                if (authService.user.is_pastor) {
                    $(elm).on('mouseover', '.fc-day', function (e) {
                        var elem = e.currentTarget;
                        $(elem).append("<span style='padding-top: 10%' class='add-sermon-label'><strong>Click to add sermon</strong></span>");
                    });
                    $(elm).on('mouseleave', '.fc-day', function (e) {
                        var elem = e.currentTarget;
                        $(elem).find('.add-sermon-label').remove();
                    });
                }

            }
        };
    })
    .directive('calendar', function ($compile) {
        return {
            restrict: 'A',
            scope: {
                select: '&',
                actionLinks: '=',
                events: '=',
                eventClick: '='
            },
            link: function (scope, element, attrs) {

                //Generate the Calendar
                element.fullCalendar({
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
                    select: function (start, end, allDay) {
                        scope.select({
                            start: start,
                            end: end
                        });
                    },

                    eventClick: function (calEvent, jsEvent, view) {
                        console.log(arguments);
                        scope.eventClick(calEvent, jsEvent, view);
                    }
                });


                //Add action links in calendar header
                element.find('.fc-toolbar').append($compile(scope.actionLinks)(scope));
            }
        }
    })
    .directive('toggleSidebar', function () {
        return {
            restrict: 'A',
            scope: {
                modelLeft: '=',
                modelRight: '='
            },

            link: function (scope, element, attr) {
                element.on('click', function () {

                    if (element.data('target') === 'mainmenu') {
                        if (scope.modelLeft === false) {
                            scope.$apply(function () {
                                scope.modelLeft = true;
                            })
                        }
                        else {
                            scope.$apply(function () {
                                scope.modelLeft = false;
                            })
                        }
                    }

                    if (element.data('target') === 'chat') {
                        if (scope.modelRight === false) {
                            scope.$apply(function () {
                                scope.modelRight = true;
                            })
                        }
                        else {
                            scope.$apply(function () {
                                scope.modelRight = false;
                            })
                        }

                    }
                })
            }
        }
    });
