import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import { Comments } from '../../api/discus.api.js';
import './discussion.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.list', function() {});
Meteor.subscribe('comments.list', function() {});

Template.discussionPageTemplate.onCreated(function () {
    this.autorun(function(){
        Comments.find({discussionId : Session.get('activeDiscussionId')}).observeChanges({
            added: function(id, fields) {
                // console.log('doc inserted');
                if(Session.get('discussionIsRendered')){
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
});

Template.discussionPageTemplate.onRendered(function () {
    Session.set('discussionIsRendered', true);
    $('.discussion-page-content').scrollTop( $('.discussion-page-content').get(0).scrollHeight );
});

Template.discussionPageTemplate.events({
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
