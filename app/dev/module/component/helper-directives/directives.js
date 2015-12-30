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
    .directive('growlDemo', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                function notify(from, align, icon, type, animIn, animOut){
                    console.log(arguments);
                    $.growl({
                        icon: icon,
                        title: ' Bootstrap Growl ',
                        message: 'Turning standard Bootstrap alerts into awesome notifications',
                         url: 'http://google.com'
                    },{
                            element: 'body',
                            type: type,
                            allow_dismiss: true,
                            placement: {
                                    from: from,
                                    align: align
                            },
                            offset: {
                                x: 20,
                                y: 85
                            },
                            spacing: 10,
                            z_index: 1031,
                            delay: 2500,
                            timer: 1000,
                            url_target: '_blank',
                            mouse_over: false,
                            animate: {
                                    enter: animIn,
                                    exit: animOut
                            },
                            icon_type: 'class',
                            template: '<div data-growl="container" class="alert" role="alert">' +
                                            '<button type="button" class="close" data-growl="dismiss">' +
                                                '<span aria-hidden="true">&times;</span>' +
                                                '<span class="sr-only">Close</span>' +
                                            '</button>' +
                                            '<span data-growl="icon"></span>' +
                                            '<span data-growl="title"></span>' +
                                            '<span data-growl="message"></span>' +
                                            '<a href="#" data-growl="url"></a>' +
                                        '</div>'
                    });
                }

                element.on('click', function(e){
                    e.preventDefault();

                    var nFrom = attrs.from;
                    var nAlign = attrs.align;
                    var nIcons = attrs.icon;
                    var nType = attrs.type;
                    var nAnimIn = attrs.animationIn;
                    var nAnimOut = attrs.animationOut;

                    notify(nFrom, nAlign, nIcons, nType, nAnimIn, nAnimOut);

                })


            }
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
    });