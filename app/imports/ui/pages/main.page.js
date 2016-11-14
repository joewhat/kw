import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Discussions } from '../../api/discus.api.js';
import { DiscussionUserMeta } from '../../api/discus.api.js';
import { Session } from '../../api/session.api.js';
import './main.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussionUserMeta.collection', function() {});

const PAGE_INC = 30;
Session.setDefault('mainDis:searchQuery', '');
Session.setDefault('mainDis:loadingNewContent', false);
Session.setDefault('mainDis:loadContentLimit', PAGE_INC);
Session.setDefault('mainDis:backspaceCheck', 0);

Template.mainPageTemplate.onCreated(function(){
  let template = Template.instance();

  template.searchQuery = new ReactiveVar();
  template.searching   = new ReactiveVar( false );
  template.subRdy = new ReactiveVar( false );

  template.autorun( () => {
    template.subscribe(
      'discussions.collection',
      template.searchQuery.get(),
      Session.get('mainDis:loadContentLimit'),
       () => {

      if (template.subscriptionsReady()) {
        template.subRdy.set(true);
        Session.set('mainDis:loadingNewContent', false);
      }

      setTimeout( () => {
        template.searching.set( false );
      }, 300 );
    });
  });
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

    'scroll .discussion-list'(event) {
      const $content = $(event.target);
      const topOffset = 100;
      const bottomOffset = 50;
      const wrapperHeight = $content.height();
      const contentHeight = $content[0].scrollHeight;
      let calculation = $content.scrollTop() + wrapperHeight;

      if (calculation > (contentHeight - bottomOffset)) {
        // At the bottom

        if (!Session.get('mainDis:loadingNewContent')) {
            Session.set('mainDis:loadingNewContent', true);
            Session.set('mainDis:loadContentLimit', Session.get('mainDis:loadContentLimit') + PAGE_INC);
            // console.log('is at the bottom! cal: ', calculation, ' cHight: ', contentHeight);
        }
      } else if ($content.scrollTop() < topOffset) {
        // At the top
        // console.log('at the top! $wrapper.scrollTop: ', $content.scrollTop(), ' cHight: ', contentHeight);
      } else {
        // in the middle
        // console.log('$wrapper.scrollTop: ', $content.scrollTop(), ' cHight: ', contentHeight);
      }
      // console.log('scrolling: ', wrapperHeight, ' ', contentHeight, ' ', calculation);
    },

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
        // console.log('set activeDiscussionId');
        BlazeLayout.render('mainLayout', {layer1: 'discussionPageTemplate'});
    },

  // search main page
  'click .global-main-search-button'(event) {
    const _this = $(event.target).closest('.global-main-search-button');
    if(_this.hasClass('search-activated')){
        _this.removeClass('search-activated');
        $('.global-main-search').val('');
        $('.global-main-search').focus();
        // Session.set('mainDis:searchQuery', '');
        template.searchQuery.set( '' );
    }
  },

  'keyup .global-main-search' (event, template){
    const keyCode = event.which;
    const _searchButton = $(event.target).siblings('.global-main-search-button');
    let value = event.target.value.trim();

    if ( event.which == 27) {
      _searchButton.removeClass('search-activated');
      $(event.target).val('');
      template.searchQuery.set( '' );
      Session.set('mainDis:loadContentLimit', PAGE_INC);
    }

    if (value === '') {
      if (Session.get('mainDis:backspaceCheck') == 0) {
        console.log('backspace: ', value);
        template.searchQuery.set( value );
        Session.set('mainDis:loadContentLimit', PAGE_INC);
      }
      Session.set('mainDis:backspaceCheck', Session.get('mainDis:backspaceCheck') + 1);
    } else {

      template.searchQuery.set( value );
      template.searching.set( true );
      Session.set('mainDis:backspaceCheck', 0);
    }
  }
});

Template.mainPageTemplate.helpers({

  searching() {
    return Template.instance().searching.get();
  },

  query() {
    return Template.instance().searchQuery.get();
  },

  subRdy() {
    return Template.instance().subRdy.get();
  },

  test(input) {
    console.log('input: ', input);
  },

  unread(id) {
    let data = {
      username: Meteor.user().username,
      discussionId: id
    }
    const unreadComments = DiscussionUserMeta.find({
      username : data.username,
      "unreadDiscussionMeta.discussionId" : data.discussionId
      }
      // ,{fields: { "unreadDiscussionMeta.$": 1}}
    ).fetch();
    
    console.log('unreadComments: ', unreadComments, ' id: ', id);
    // return unreadComments[0].unreadDiscussionMeta[0].unReadCount;
  },

  // disListNotEmpty : function() {
  //   const searchQuery = Session.get('mainDis:searchQuery');
  //   let query = {};
  //
  //   if (searchQuery) {
  //     query.header = new RegExp(helpers.regexMultiWordsSearch(searchQuery), 'i');
  //   }
  //
  //   return Discussions.find(query).count();
  // },

  allDiscussions : function() {
      // search
      const searchVal = Template.instance().searchQuery.get();
      if(!searchVal){
          // default return (sort after latestComment)
          return Discussions.find({}, {sort: {latestComment: -1}});
      }else{
          // search result
          return Discussions.find({}, {sort: {header: +1} });
      }

      // const searchQuery = Session.getNonReactive('mainDis:searchQuery');

      // console.log('this is wtf');
      // if (searchQuery.length > 1) {
      //   return Discussions.find({});
      // } else {
      //   return Discussions.find({}, {
      //     sort: {latestComment: -1}
      //   });
      // }
      // console.log('allDis');
      // return Discussions.find({});

      // let discussions = Discussions.find({});
      // if ( discussions ) {
      //   return discussions;
      // }
  },

  convertedDate : function() {
    return helpers.convertDate(this.createdAt);
    },
});
