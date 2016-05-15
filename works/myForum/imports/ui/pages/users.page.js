import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import '../../api/users.api.js';
// import '../../api/helpers.api.js';
// import stringMatch from '../../api/helpers.api.js';
const helpers = require('../../api/helpers.api.js');

import './users.page.html';

let validationError = 'please fix input errors';

Meteor.startup(() => {
  resetFormSession();
});

Meteor.subscribe('user.list', function() {

});

// deleteUserTemplate
Template.deleteUserTemplate.helpers({
    userNameToDelete : function(){
        return Meteor.users.findOne( { _id: Session.get('deleteUserId') } ).username;
    }
});

Template.deleteUserTemplate.events({
  'click .delete-the-user'(event) {
     Meteor.call('delete-user', Session.get('deleteUserId'));
     Session.set('modalLoad', '');
  },
});
// UsersTemplate
Template.usersTemplate.events({
    'click .addUser-button'(event) {
        Session.set('modalLoad', 'addUsersTemplate');
    },

    // search users
    'click .global-users-search-button'(event) {
        const _this = $(event.target).closest('.global-users-search-button');
        if(_this.hasClass('search-activated')){
            _this.removeClass('search-activated');
            $('.global-users-search').val('');
            Session.set('globalSearchValue', '');
        }
    },
    'keyup .global-users-search' (event){
        //console.log('typing in search: ' + $(event.target).val());
        const _searchButton = $(event.target).siblings('.global-users-search-button');
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


// AllUsersTemplate
Template.AllUsersTemplate.events({
  'click .user-delete'(event) {
      Session.set('modalLoad', 'deleteUserTemplate');
      Session.set('deleteUserId', $(event.target).closest('.user-delete').attr('id'));
  },
  'click .user-li'(event) {
        if($('.selected-user').length) {
          $('.selected-user').removeClass('selected-user');
        }

        if($(event.target).parents('.user-li').length) {
          $(event.target).parents('.user-li').addClass('selected-user');
        }else{
          $(event.target).addClass('selected-user');
        }
    },
    'click .user-edit'(event) {
        //console.log('edit user:' + $(event.target).closest('.user-edit').attr('id'));
        Session.set('modalLoad', 'editUserTemplate');
        Session.set('editUserId', $(event.target).closest('.user-edit').attr('id'));
    },

});

Template.AllUsersTemplate.helpers({
  AllUsers : function(){
      // search
      const searchVal = Session.get('globalSearchValue');
      if(!searchVal){
          // default return
          return Meteor.users.find({}, {sort: {username: +1} });
      }else{
          // search result
          const regex = new RegExp(helpers.regexMultiWordsSearch(searchVal), 'i');
          return Meteor.users.find({username: regex}, {sort: {username: +1} });
      }
     console.log('session search val: ' + Session.get('globalSearchValue'));

  },
  ShowDelete: function(){
    if(Meteor.userId() !== this._id){
      return true;
    }else{
      return false;
    }
  }
});

Template.AllUsersTemplate.onRendered(function(){

});

function resetFormSession() {
  Session.set('create-new-user-usernameIsOkay', false);
  Session.set('create-new-user-emailIsOkay', false);
  Session.set('create-new-user-passwordIsOkay', false);
  Session.set('create-new-user-passwordsMatch', false);
}
