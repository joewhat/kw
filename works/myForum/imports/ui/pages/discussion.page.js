import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import { Comments } from '../../api/discus.api.js';
import { DiscussionUserMeta } from '../../api/discus.api.js';
import './discussion.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.collection', function() {});
Meteor.subscribe('comments.collection', function() {});
Meteor.subscribe('discussionUserMeta.collection', function() {});


Template.discussionPageTemplate.onCreated(function () {

    const _thisData = {
        username : Meteor.user().username,
        discussionId : Session.get('activeDiscussionId')
    };
    console.log('add-user-to-discussion: ', _thisData);
    Meteor.call('add-user-to-discussion', _thisData, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
      }
    });

    Meteor.call('clear-unread-comment-for-discussionId', _thisData, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
      }
    });

    Meteor.call('clear-is-discussion-new', _thisData, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
      }
    });
});

Template.discussionPageTemplate.onDestroyed(function () {
    // remove user from Discussions collection userInDis
    if(Meteor.user()){
        const _thisData = {
            username : Meteor.user().username,
            discussionId : DiscussionUserMeta.find({username:Meteor.user().username}).fetch()[0].activeDiscussionId
        }

        console.log('remove-user:', DiscussionUserMeta.find({username:Meteor.user().username}).fetch()[0].activeDiscussionId);

        Meteor.call('remove-user-from-discussion', _thisData, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {
              console.log('remove user from dis');
          }
        });
        // reset active session id
        Session.set('activeDiscussionId', '');
    }
});



Template.discussionPageTemplate.onRendered(function () {
    let addedUpdateCount = 0;
    const commentCount = Comments.find({discussionId : Session.get('activeDiscussionId')}).count();
    Session.set('discussionScrollPosition', 'bottom');
    Session.set('discussionScrollIsAnimating', false);
    // Session.set('discussionIsRendered', true);
    this.autorun(function(){
        Comments.find({discussionId : Session.get('activeDiscussionId')}).observeChanges({
            added: function(id, fields) {
                addedUpdateCount++;
                if(addedUpdateCount > commentCount){
                    // console.log('what thefuck: ' + addedUpdateCount + ' ' + commentCount);
                    // scroll to bottom after new msg
                    Tracker.afterFlush(function () {
                        if (Session.get('discussionScrollPosition') == 'bottom') {
                          scrollDisListToBottom(true);
                        }
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

        // scroll to bottom on rendered
        scrollDisListToBottom();

      Meteor.defer(function() {
          const $wrapper = $('.discussion-page-content');
          const $content = $wrapper.find('.discussion-msg-list');
          const topOffset = 100;
          const bottomOffset = 50;

          $wrapper.on('scroll', function(e) {
            const wrapperHeight = $wrapper.height();
            const contentHeight = $content.height();
            let calculation = $wrapper.scrollTop() + wrapperHeight;

            if (calculation > (contentHeight - bottomOffset)) {
              // At the bottom
              console.log('is at the bottom! cal: ', calculation, ' cHight: ', contentHeight);
              Session.set('discussionScrollPosition', 'bottom');
            } else if ($wrapper.scrollTop() < topOffset) {
              // At the top
              Session.set('discussionScrollPosition', 'top');
              console.log('at the top! $wrapper.scrollTop: ', $wrapper.scrollTop(), ' cHight: ', contentHeight);
            } else {
              // in the middle
              Session.set('discussionScrollPosition', 'middle');
              console.log('$wrapper.scrollTop: ', $wrapper.scrollTop(), ' cHight: ', contentHeight);
            }
          });
      });
    });


});


Template.discussionPageTemplate.events({
    // 'scroll .discussion-page-content'(event){
    //     console.log('scolling');
    // },

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

            // Meteor.call('userUnread-insert', userUnreadData, function( error, response ) {
            //   if ( error ) {
            //     // Handle our error.
            //     console.log('wtf: ' + error);
            //   } else {
            //     // Handle our return value.
            //     // console.log('allusernames', response);
            //   }
            // });
          }
        });

        $('.the-comment').val('');
        $('.the-comment').focus();
        scrollDisListToBottom(true);
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

const scrollDisListToBottom = function(animate = false) {
  if (animate && !Session.get('discussionScrollIsAnimating')) {
    Session.set('discussionScrollIsAnimating', true);
    $('.discussion-page-content').animate(
      { scrollTop:
        $('.discussion-page-content').get(0).scrollHeight
      }, 400, function() {
        // Animation complete.
        Session.set('discussionScrollIsAnimating', false);
      });
  } else {
    $('.discussion-page-content').scrollTop(
      $('.discussion-page-content').get(0).scrollHeight);
  }
}
