App
    .directive('mention', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $(element).on('change', function () {
                    console.log(arguments);
                });

            }
        }

    })
    .directive('comment', function (userService, util, authService, alertService) {
        return {
            restrict: 'E',
            scope: {
                comment: '='
            },
            link: function (scope, element) {

                scope.util = util;
                scope.user = authService.getUser();

                /**
                 * Like or unlike comment
                 * @param c
                 */
                scope.like = function (c) {
                    var i = c.likes_key.indexOf(authService.user.id);

                    if (i >= 0) {
                        userService.unlikeComment(c.id).then(function (resp) {
                            if (resp.data.status == 'success') {
                                c.like_count -= 1;
                                c.likes_key.splice(i, 1);
                            }
                        });
                        //unlike
                    } else {
                        userService.likeComment(c.id).then(function (resp) {
                            if (resp.data.status == 'success') {
                                c.like_count += 1;
                                c.likes_key.push(authService.user.id);
                            }
                        });
                    }
                };
                //scope.reply = function (user) {
                //    scope.replyTo = {
                //        id: user.id,
                //        name: user.first_name + ' ' + user.last_name
                //    };
                //    scope.showReply = true;
                //
                //};

                /**
                 * Post reply to comment
                 */
                scope.postReply = function () {
                    var comment = scope.comment;
                    var replyElement = $(element).find('.reply-text');
                    var reply = replyElement.html();

                    if (_.isEmpty(reply)) return;

                    var data = {
                        comment: reply,
                        reply_to: comment.id
                    };

                    userService.postComment(data, comment.ref_key, comment.ref_kind)
                        .then(function (resp) {
                                console.log(resp.data);
                                if (resp.data.id) {
                                    comment.replies.comments.unshift(resp.data);
                                    replyElement.html('');
                                    comment.replies_key.push(resp.data.id);
                                    comment.reply_count++;
                                } else {
                                    alertService.danger('Failed to save your reply, please try again.');
                                }
                            }
                        )

                };

            },
            templateUrl: 'module/component/feed/comment.html'
        }
    })
    .directive('comments', function (userService, alertService) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function (scope, element) {


                /**
                 * Post a reply to a comment
                 * @param c
                 */
                scope.postReply = function (c) {
                    console.log($(element));
                    console.log($(element).find('.reply-text').html());
                    if (_.isEmpty(c.reply)) return;
                    var data = {
                        comment: c.reply,
                        reply_to: c.id
                    };
                    userService.postComment(data, c.ref_key, c.ref_kind)
                        .then(function (resp) {
                                console.log(resp.data);
                                if (resp.data.id) {
                                    c.replies.comments.unshift(resp.data);
                                    c.reply = '';
                                    c.replies_key.push(resp.data.id);
                                    c.reply_count++;
                                } else {
                                    alertService.danger('Failed to post comment, please try again');
                                }
                            }
                        )

                };
            },
            templateUrl: 'module/component/feed/comments.html'
        }
    })
    .directive('feed', function (authService, util, userService, $compile) {
        return {
            restrict: 'E',
            scope: {
                feed: '='
            },
            link: function (scope, element) {
                var feed = scope.feed;
                feed.showComments = (feed.comment_count > 5) ? false : true;
                scope.util = util;
                scope.user = authService.user;


                scope.postComment = function (comment) {

                    userService.postComment({comment: comment}, feed.id, feed.kind).then(function (resp) {
                            if (resp.data.id) {
                                //feed.comments is an object
                                //with comment array and
                                //next for cursor id
                                feed.comments.comments.unshift(resp.data);
                                feed.newComment_ = '';
                                feed.comment_count++;
                            } else {
                                alertService.danger('Failed to post comment, please try again');
                            }
                        }
                    )


                };
                scope.more = function () {
                    feed.displayText = feed.fullText;
                };

                function formatContent(content) {
                    var l = content.length;
                    if (l > 600) {
                        console.log($compile('<a  href ng-click="test()">more</a>')(scope));
                        return util.trim(content, 600) + '...' + '<a  href ng-click="more()">more</a>';
                    }
                    return content;
                }

                //process display text
                switch (feed.kind) {
                    case 'Sermon':
                        feed.fullText = feed.displayText = '<h3 class="m-t-5 m-b-5"><a href="#/sermon/' + feed.id + '">' + feed.title + '</a></h3> <br>';
                        console.log(feed.displayText);
                        if (_.isEmpty(feed.summary)) {
                            if (!_.isEmpty(feed.note)) {
                                feed.displayText += formatContent(feed.note);
                                feed.fullText += (feed.note);
                            } else {
                                // sermon not in bullet points.
                                var content = '';
                                for (var i = 0; i < feed.notes.length; i++) {
                                    content += feed.notes[i].content;
                                }
                                feed.displayText += formatContent(content);
                                feed.fullText += feed.note;

                            }
                        } else {
                            feed.displayText += formatContent(feed.summary);
                            feed.fullText += feed.summary;
                        }
                        break;
                    case 'Post':
                        feed.displayText = formatContent(feed.content);
                        feed.fullText = feed.content;
                }


                scope.busy = false;

                scope.liked = function () {
                    return feed.likers_key.indexOf(scope.user.id) >= 0;
                    //if (feed.kind == 'Sermon') {
                    //    var i = scope.user.fav_sermon_keys.indexOf(feed.id);
                    //    return i >= 0;
                    //}
                    //return false;
                };
                //handle like or unlike
                scope.like = function () {
                    if (feed.kind == 'Sermon') {
                        userService.likeSermon(scope.user, feed);
                    } else if (feed.kind == 'Post') {
                        userService.likePost(scope.user, feed)
                    }
                };


            },
            templateUrl: function () {
                return 'module/component/feed/feed.html';
            }

        }
    });