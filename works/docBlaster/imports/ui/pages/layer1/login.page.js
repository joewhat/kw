import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './login.page.html';

Template.loginTemplate.events({
    'submit .custom-login-form'(event) {
        event.preventDefault();
        const loginUsername = event.target.loginUsername.value;
        const loginPassword = event.target.loginPassword.value;
        Meteor.loginWithPassword(loginUsername, loginPassword, function(err){
          if(err){
            $('.custom-login-form-error').text('Invalid Username or Password');
          }
        });
    }
});
