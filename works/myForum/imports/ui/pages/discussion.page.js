import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import { Comments } from '../../api/discus.api.js';
import './discussion.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.list', function() {});
Meteor.subscribe('comments.list', function() {});




Template.discussionPageTemplate.onRendered(function () {
    let addedUpdateCount = 0;
    const commentCount = Comments.find({discussionId : Session.get('activeDiscussionId')}).count();
    // Session.set('discussionIsRendered', true);
    this.autorun(function(){
        Comments.find({discussionId : Session.get('activeDiscussionId')}).observeChanges({
            added: function(id, fields) {
                addedUpdateCount++;
                if(addedUpdateCount > commentCount){
                    // console.log('what thefuck: ' + addedUpdateCount + ' ' + commentCount);
                    Tracker.afterFlush(function () {
                        $('.discussion-page-content').animate({ scrollTop: $('.discussion-page-content').get(0).scrollHeight}, 400);
                    });
                }
            },
            changed: function(id, fields) {
                // console.log('doc updated');
            },
            removed: function() {
                // console.log('doc removed');
            }
        });
    });
    $('.discussion-page-content').scrollTop( $('.discussion-page-content').get(0).scrollHeight );
});


Template.discussionPageTemplate.events({
    'scroll .discussion-page-content'(event){
        console.log('scolling');
    },

    'click .back-to-discussion-button'(event) {
        Session.set('discussionIsRendered', false);
        BlazeLayout.render('mainLayout', {layer1: 'mainPageTemplate'});
    },
    'click .add-comment-button'(event) {
        event.preventDefault();

        const data = $('.add-comment-form').serializeJSON();
        data.discussionId = Session.get('activeDiscussionId');
        Meteor.call('comments-insert', data, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {
            // Handle our return value.
            // console.log('comment response: ', response);

            const discussionHeader = Discussions.findOne({_id : Session.get('activeDiscussionId')}).header;
            //  console.log('discussionHeader: ', discussionHeader);
            const userUnreadData = {
                commentId: response,
                discussionName: discussionHeader
            };

            // console.log(userUnreadData);

            Meteor.call('userUnread-insert', userUnreadData, function( error, response ) {
              if ( error ) {
                // Handle our error.
                console.log('wtf: ' + error);
              } else {
                // Handle our return value.
                // console.log('allusernames', response);
              }
            });
          }
        });

        $('.the-comment').val('');
        $('.the-comment').focus();
    },
});



Template.discussionPageTemplate.helpers({
    disMeta : function(){
        return Discussions.findOne({_id : Session.get('activeDiscussionId')});
    },
    convertedDate : function(){
        return helpers.convertDate(disMeta.createdAt);
    },
    allComments : function(){
        return Comments.find({discussionId : Session.get('activeDiscussionId')}, {sort: {createdAt: +1}});
    }
});
