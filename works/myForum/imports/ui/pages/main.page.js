import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
// import '../../api/discus.api.js';
import './main.page.html';

// const helpers = require('../../api/helpers.api.js');
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.list', function() {});

Template.mainPageTemplate.events({
    'click .new-discussion-button'(event) {
        Session.set('modalLoad', 'newDisTemplate');
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
  }
});
