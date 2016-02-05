/**
 * Created by eanjorin on 12/11/15.
 */
App

    .directive('nameTag', function () {
        return {
            restrict: 'E',
            scope: {
                user: '='
            },
            template: '<a href ><span ng-if="user.title">{{user.title}}</span>' +
            '<span> {{user.first_name | sentencecase}}</span>' +
            '<span> {{user.last_name | sentencecase}}</span> </a>'
        }

    })
    .directive('autoSave', function (userService) {
        return {
            restrict: 'EA',
            scope: {
                note: '='
            },
            link: function (scope) {
                console.log(scope.note);
                scope.$watch(function () {
                    if (scope.note) {
                        return scope.note.notes;
                    }
                }, function (n, o) {
                    if (o !== n) {
                        scope.note.saving = true;
                        userService.saveSermonNote(scope.note).then(function (resp) {
                            scope.note.saving = false;
                            if (resp.data.id) {
                                //self.sermonNote.id = resp.data.id;
                                //self.sermonNote.user_id = resp.data.created_by;
                                // self.sermonNote.sermon_id = resp.data.sermon_key;
                                scope.note.modified_at = resp.data.modified_at;
                            }
                        });
                    }
                })
            }
        }
    })
    .directive('focusCursor', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                //  console.log(element);
                var node = element;
                node.focus();
                //var caret = 0; // insert caret after the 10th character say
                //var range = document.createRange();
                //range.setStart(node, caret);
                //range.setEnd(node, caret);
                //var sel = window.getSelection();
                //console.log(sel);
                //sel.removeAllRanges();
                //sel.addRange(range);
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
    .directive('scriptureChip', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                console.log($(element).find('md-chip'));
                $(element).find('md-chip').on('click', function () {
                    console.log(123);
                });
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
    .directive('toggleSubmenu', function () {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    element.next().slideToggle(200);
                    element.parent().toggleClass('toggled');
                });
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
