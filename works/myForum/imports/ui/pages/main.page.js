import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import { UnreadUserCollection } from '../../api/discus.api.js';
import './main.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.list', function() {});
Meteor.subscribe('userUnread.list', function() {});

Template.mainPageTemplate.onCreated(function(){
    // let unreadComments = UnreadUserCollection.find( { username : Meteor.user().username} );
    // let unreadComments = UnreadUserCollection.find( { username : Meteor.user().username} ).unreadDiscussionMeta;
    //  { fields : { unreadDiscussionMeta : 1 } }






});

Template.mainPageTemplate.onRendered(function () {



    this.autorun(function(){
        UnreadUserCollection.find({username : Meteor.user().username}).observeChanges({
            added: function(id, fields) {
                    console.log('doc added', id , fields);
            },
            changed: function(id, fields) {
                console.log('doc updated', id , fields);
            },
            removed: function() {
                console.log('doc removed', id , fields);
            }
        });
    });

});

function updateUnread(){
    const data = {
        username : Meteor.user().username,
        discussionId : this._id
    };
    const header = this.header;
    Meteor.call('get-unread-comment-for-discussionId', data, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
          console.log('response: ' + response + ' header: ' + header);

      }
    });

}

Template.mainPageTemplate.events({
    'click .new-discussion-button'(event) {
        Session.set('modalLoad', 'newDisTemplate');
    },
    // enter a discussion
    'click .discussion'(event) {
        const id = $(event.target).attr('data-id');
        Session.set('activeDiscussionId', $(event.target).closest('.discussion').attr('data-id'));
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
    userUnread : function(){
        if(this._id != undefined){
            console.log('this._id: ' + this._id);
            // , 'unreadDiscussionMeta.discussionId' : this._id

            const data = {
                username : Meteor.user().username,
                discussionId : this._id
            };
            const header = this.header;
            Meteor.call('get-unread-comment-for-discussionId', data, function( error, response ) {
              if ( error ) {
                // Handle our error.
                console.log('wtf: ' + error);
              } else {
                  console.log('response: ' + response + ' header: ' + header);

              }
            });


            // , {fields: { "unreadDiscussionMeta.$": 1}}
            // const unreadComments = UnreadUserCollection.find( { username : Meteor.user().username, "unreadDiscussionMeta.discussionId" : this._id}).fetch();
            // if(unreadComments[0].unreadDiscussionMeta != undefined){
            //
            //     console.log('fuckyou TOOO', unreadComments[0].unreadDiscussionMeta);
            // }
            //console.log('fuckyou', unreadComments[0].unreadDiscussionMeta[0].unReadCount);
        }
        // const allUnread = UserUnread.find( { username: Meteor.user().username } ).fetch();
        // allUnread.forEach(function(value){
        //         console.log('allUnread: ' + value.discussionName);
        // });
        //
        //
        // const joe = allUnread.aggregate(
        //   [{$group: {
        //       _id: "$discussionName",
        //       count: { $sum : 1 }
        //     }}, {
        //     $group: {
        //       _id: "$_id",
        //       count: { $sum : "$count" }
        //     }},{
        //       $out: "distinctCount"
        //     }],
        //  {allowDiskUse:true}
        // );
        // console.log('joe: ', joe);
        //
        //
        // return UserUnread.find( { username: Meteor.user().username } ).count();
    }

});
