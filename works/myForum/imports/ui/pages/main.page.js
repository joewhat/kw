import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import { UnreadUserCollection } from '../../api/discus.api.js';
import './main.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.list', function() {});
Meteor.subscribe('userUnread.list', function() {});

Template.mainPageTemplate.onCreated(function(){

});

Template.mainPageTemplate.onRendered(function () {
    this.autorun(function(){
        UnreadUserCollection.find({username : Meteor.user().username}).observeChanges({
            added: function(id, fields) {
                    // console.log('doc added',fields);
                    updateUnread();
            },
            changed: function(id, fields) {
                // console.log('doc updated',fields);
                updateUnread();
            },
            removed: function() {
                // console.log('doc removed',fields);
                updateUnread();
            }
        });

        Meteor.defer(function(){
            const allDisOnPage = $('.discussion');
            $.each(allDisOnPage, function( index, value ) {
                const discussionId = $(value).attr('id');
              const data = {
                  username : Meteor.user().username,
                  discussionId : discussionId
              };
              Meteor.call('is-discussion-new', data, function( error, response ) {
                if ( error ) {
                  // Handle our error.
                  console.log('wtf: ' + error);
                } else {
                    if(response){
                        $('#' + discussionId).children('.isNew').html('new');
                    }

                }
              });
            });
        });
    });
});

function updateUnread(){
    const searchVal = Session.get('globalSearchValue');
    if(!searchVal){
        // default return (sort after createdAt)
        const allDis = Discussions.find({}, {sort: {latestComment: -1}}).fetch();
        updateUnreadHtml(allDis);
    }else{
        // search result
        const regex = new RegExp(helpers.regexMultiWordsSearch(searchVal), 'i');
        const allDis = Discussions.find({header: regex}, {sort: {header: +1} }).fetch();
        updateUnreadHtml(allDis);
    }
}

function updateUnreadHtml(allDis){
    allDis.forEach(function(value){
        const data = {
            username : Meteor.user().username,
            discussionId : value._id
        };
        const header = value.header;
        Meteor.call('get-unread-comment-for-discussionId', data, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {
              if(response == 0){
                  $('#' + data.discussionId).children('.unread').html();
              }else{
                    $('#' + data.discussionId).children('.unread').html(response);
              }
          }
        });
    });
}

Template.mainPageTemplate.events({
    'click .new-discussion-button'(event) {
        Session.set('modalLoad', 'newDisTemplate');
    },
    // enter a discussion
    'click .discussion'(event) {
        const id = $(event.target).attr('data-id');
        const discussionId =  $(event.target).closest('.discussion').attr('data-id');
        Session.set('activeDiscussionId', discussionId);
        const data = { username: Meteor.user().username, discussionId: discussionId };
        Meteor.call('update-active-discussionId', data, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {

          }
        });
        console.log('set activeDiscussionId');
        BlazeLayout.render('mainLayout', {layer1: 'discussionPageTemplate'});
    },
    // search main page
    'click .global-main-search-button'(event) {
        const _this = $(event.target).closest('.global-main-search-button');
        if(_this.hasClass('search-activated')){
            _this.removeClass('search-activated');
            $('.global-main-search').val('');
            Session.set('globalSearchValue', '');
        }
    },
    'keyup .global-main-search' (event){
        //console.log('typing in search: ' + $(event.target).val());
        const _searchButton = $(event.target).siblings('.global-main-search-button');
        // activate search
        if(!_searchButton.hasClass('search-activated')){
            _searchButton.addClass('search-activated');
        }
        // cancel search
        if(event.which == 27 || $(event.target).val() == ''){
            _searchButton.removeClass('search-activated');
            $(event.target).val('');
            Session.set('globalSearchValue', '');
        }else{
            // set global search value
            Session.set('globalSearchValue', $(event.target).val());
        }
    }
});

Template.mainPageTemplate.helpers({
  allDiscussions : function(){
      // search
      const searchVal = Session.get('globalSearchValue');
      if(!searchVal){
          // default return (sort after createdAt)
          return Discussions.find({}, {sort: {latestComment: -1}});
      }else{
          // search result
          const regex = new RegExp(helpers.regexMultiWordsSearch(searchVal), 'i');
          return Discussions.find({header: regex}, {sort: {header: +1} });
      }
  },
  convertedDate : function(){
    return helpers.convertDate(this.createdAt);
    },
});
