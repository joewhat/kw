import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import '../../api/users.api.js';
import '../../api/helpers.api.js';
import stringMatch from '../../api/helpers.api.js';

import './admin.page.html';

let validationError = 'please fix input errors';

Meteor.startup(() => {
  resetFormSession();
  console.log('startup yo');
});

Template.AllUsersTemplate.events({
  'click .user-delete'(event) {
    if (confirm('Are you sure you want to delete this user?')) {
      Meteor.call('delete-user', $(event.target).attr('id'));
    }
  },
});

Meteor.subscribe('user.list', function() {
  console.log('sub on userList');
});

Template.AllUsersTemplate.helpers({
  AllUsers : function(){
    return Meteor.users.find({}, {sort: {username: +1} });
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
  console.log('template is rendered');
});


// Create new user
Template.CreateNewUserTemplate.events({
  'submit .create-new-user-form'(event) {
    event.preventDefault();

    if(formValidate()){
      const data = $('.create-new-user-form').serializeJSON();
      Meteor.call('create-new-user', data);
      resetFormSession();
      // Clear form
      event.target.username.value = '';
      event.target.email.value = '';
      event.target.password.value = '';
      event.target.passwordAgain.value = '';
      $('.create-new-user-form-validation-feedback').text('');
    }else{
      $('.create-new-user-form-validation-feedback').text(validationError);
      return null;
    }
  },
  // Validate Username
  'keyup .create-new-user-form input[name=username]' (event){
      const inputUsername = event.target.value;
      const ptn = /^[a-zA-Z0-9_.-]+$/;

      if (ptn.test(inputUsername)) {
        if( Meteor.users.findOne({username: inputUsername}) ){
          Session.set('create-new-user-usernameIsOkay', false);
        }else{
          Session.set('create-new-user-usernameIsOkay', true);
        }
      }
  },
  // Validate Email
  'keyup .create-new-user-form input[name=email]' (event){
      const ptn = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+\.\w+$/;
      const emailExists = Meteor.users.find({"emails.address": event.target.value}, {limit: 1}).count()>0;

      console.log('emailExists: ' + emailExists);
      if (ptn.test(event.target.value)) {
        if(!emailExists){
          Session.set('create-new-user-emailIsOkay', true);
        }else{
          Session.set('create-new-user-emailIsOkay', false);
        }
      }
  },
  // check for valid password
  'keyup .create-new-user-form input[name=password]' (event){

    if(event.target.value.length >= 6){
      Session.set('create-new-user-passwordIsOkay', true);
    }else{
      Session.set('create-new-user-passwordIsOkay', false);
    }
  },
  // check if passwords match
  'keyup .create-new-user-form input[name=passwordAgain]' (event){
    if(stringMatch($('.create-new-user-form input[name=password]').val(), event.target.value) && Session.get('create-new-user-passwordIsOkay')){
      Session.set('create-new-user-passwordsMatch', true);
    }else{
      Session.set('create-new-user-passwordsMatch', false);
    }
  },
});

Template.CreateNewUserTemplate.helpers({
  validUsername : function(){
    if(Session.get('create-new-user-usernameIsOkay')){
      return 'input-okay';
    }else{
      return 'input-not-okay';
    }
  },
  validEmail : function(){
    if(Session.get('create-new-user-emailIsOkay')){
      return 'input-okay';
    }else{
      return 'input-not-okay';
    }
  },
  validPassword1 : function(){
    if(Session.get('create-new-user-passwordIsOkay')){
      return 'input-okay';
    }else{
      return 'input-not-okay';
    }
  },
  validPassword2 : function(){
    if(Session.get('create-new-user-passwordsMatch')){
      return 'input-okay';
    }else{
      return 'input-not-okay';
    }
  },
});

function formValidate(){
  if(Session.get('create-new-user-usernameIsOkay') && Session.get('create-new-user-emailIsOkay') && Session.get('create-new-user-passwordIsOkay') && Session.get('create-new-user-passwordsMatch') ){
    return true;
  }else{
    return false;
  }
}

function resetFormSession() {
  Session.set('create-new-user-usernameIsOkay', false);
  Session.set('create-new-user-emailIsOkay', false);
  Session.set('create-new-user-passwordIsOkay', false);
  Session.set('create-new-user-passwordsMatch', false);
}
