import { Accounts } from 'meteor/accounts-base';

if(Meteor.isClient){
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
  });
  Accounts.config({
    forbidClientAccountCreation : true
  });
}


if(Meteor.isServer){
  Accounts.config({
    forbidClientAccountCreation : true
  });
}
