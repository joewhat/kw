import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import { DiscussionUserMeta } from '../../api/discus.api.js';
import { Session } from '../../api/session.api.js';
import './main.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.collection', function() {});
Meteor.subscribe('discussionUserMeta.collection', function() {});

Template.mainPageTemplate.onCreated(function(){
  Session.set('mainDis:pageNum', 1);
  Session.set('mainDis:numberOfPages', 1);
  Session.set('mainDis:searchQuery', null);
  Session.set('mainDis:disList.ids', []);
  Session.set('mainDis:disList.list', []);
});

Template.mainPageTemplate.onRendered(function () {
    this.autorun(function(){
        // DiscussionUserMeta.find({username : Meteor.user().username}).observeChanges({
        //     added: function(id, fields) {
        //             // console.log('doc added',fields);
        //             updateUnread();
        //     },
        //     changed: function(id, fields) {
        //         // console.log('doc updated',fields);
        //         updateUnread();
        //     },
        //     removed: function() {
        //         // console.log('doc removed',fields);
        //         updateUnread();
        //     }
        // });

        Meteor.defer(function(){
            Session.setNonReactive('globalSearchValue', '');
            $('.global-main-search').focus();

            // Check for new dis
            // const allDisOnPage = $('.discussion');
            // $.each(allDisOnPage, function( index, value ) {
            //     const discussionId = $(value).attr('id');
            //   const data = {
            //       username : Meteor.user().username,
            //       discussionId : discussionId
            //   };
            //   Meteor.call('is-discussion-new', data, function( error, response ) {
            //     if ( error ) {
            //       // Handle our error.
            //       console.log('wtf: ' + error);
            //     } else {
            //         if(response){
            //             $('#' + discussionId).find('.isNew').html('new');
            //         }
            //
            //     }
            //   });
            // });

            // pagination scroll
            // const $wrapper = $('.main-page-wrapper');
            const $content = $('.discussion-list');
            const topOffset = 100;
            const bottomOffset = 50;

            $content.on('scroll', function(e) {
              const wrapperHeight = $content.height();
              const contentHeight = $content[0].scrollHeight;
              let numberOfPages = Session.getNonReactive('mainDis:numberOfPages');
              const page = Session.getNonReactive('mainDis:pageNum');
              let calculation = $content.scrollTop() + wrapperHeight;

              numberOfPages = numberOfPages > 1 && page < numberOfPages;

              if (calculation > (contentHeight - bottomOffset)) {
                // At the bottom
                console.log('is at the bottom! cal: ', calculation, ' cHight: ', contentHeight);
                Session.set('mainDis:pageNum', page + 1);

              } else if ($content.scrollTop() < topOffset) {
                // At the top
                // console.log('at the top! $wrapper.scrollTop: ', $content.scrollTop(), ' cHight: ', contentHeight);
              } else {
                // in the middle
                // console.log('$wrapper.scrollTop: ', $content.scrollTop(), ' cHight: ', contentHeight);
              }
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
                  $('#' + data.discussionId).find('.unread').html();
              }else{
                  $('#' + data.discussionId).find('.unread').html('Unread '+response);
              }
          }
        });
    });
}

Template.mainPageTemplate.events({
    // 'click .new-discussion-button'(event) {
    //     Session.set('modalLoad', 'newDisTemplate');
    // },
    // enter a discussion
    'click .discussion'(event) {
        $('.tab-button-active').removeClass('tab-button-active');
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
            $('.global-main-search').focus();
            Session.set('mainDis:disList.ids', []);
            Session.set('mainDis:disList.list', []);
            Session.set('mainDis:searchQuery', null);
        }
    },
    'keyup .global-main-search' (event){
        //console.log('typing in search: ' + $(event.target).val());
        const _searchButton = $(event.target).siblings('.global-main-search-button');
        const searchQuery = Session.getNonReactive('mainDis:searchQuery');

        if (!!searchQuery) {
          // cancel list
          Session.set('mainDis:disList.ids', []);
          Session.set('mainDis:disList.list', []);
        }

        // activate search
        if(!_searchButton.hasClass('search-activated')){
            _searchButton.addClass('search-activated');
        }
        // cancel search
        if(event.which == 27 || $(event.target).val() == ''){
            _searchButton.removeClass('search-activated');
            $(event.target).val('');

            Session.set('mainDis:searchQuery', null);
            // Session.set('globalSearchValue', '');
            $('.global-main-search').focus();
        }else{
            // set global search value
            Session.set('mainDis:searchQuery', $(event.target).val());
        }
    }
});

Template.mainPageTemplate.helpers({

  disListNotEmpty : function() {
    const searchQuery = Session.get('mainDis:searchQuery');
    let query = {};

    if (searchQuery) {
      query.header = new RegExp(helpers.regexMultiWordsSearch(searchQuery), 'i');
    }

    return Discussions.find(query).count();
  },

  allDiscussions : function() {
      // // search
      // const searchVal = Session.get('globalSearchValue');
      // if(!searchVal){
      //     // default return (sort after createdAt)
      //     return Discussions.find({}, {sort: {latestComment: -1}});
      // }else{
      //     // search result
      //     const regex = new RegExp(helpers.regexMultiWordsSearch(searchVal), 'i');
      //     return Discussions.find({header: regex}, {sort: {header: +1} });
      // }


      // console.log('this is wtf');
      return Session.get('mainDis:disList.list');


  },

  paginate : function() {
    const pageLimit = 20;
    const mainDisList = Session.get('mainDis:disList');
    const searchQuery = Session.get('mainDis:searchQuery');
    const rList = Session.getNonReactive('mainDis:disList.list');
    const rIds = Session.getNonReactive('mainDis:disList.ids');
    let query = {};

    console.log('searchQuery:', searchQuery);
    if (searchQuery) {
      query.header = new RegExp(helpers.regexMultiWordsSearch(searchQuery), 'i');
    }
    console.log('query: ', query);

    const count = Discussions.find(query).count();
    const numberOfPages = Math.ceil(count / pageLimit);
    const pageNum = Session.get('mainDis:pageNum');

    if (numberOfPages > 1) {
      Session.setNonReactive('mainDis:numberOfPages', numberOfPages);
    } else {
      Session.setNonReactive('mainDis:numberOfPages', 1);
    }

    const pageList = Discussions.find(query, {
      // sort: {latestComment: -1},
      skip: (pageNum - 1) * pageLimit,
      limit: pageLimit
    }).fetch();

    pageList.forEach((item) => {
      if (rIds.indexOf(item._id) == -1) {
        rIds.push(item._id);
        rList.push(item);
      }
    });

    Session.set('mainDis:disList.ids', rIds);
    Session.set('mainDis:disList.list', rList);
    console.log('wtf');

  },

  convertedDate : function() {
    return helpers.convertDate(this.createdAt);
    },
});
