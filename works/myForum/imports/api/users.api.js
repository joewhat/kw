import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

import './discus.api.js';

if (Meteor.isServer) {
  Meteor.publish('user.list', function (){
    // check if user is logged in
    if(!this.userId) return null;
    if(!Roles.userIsInRole(this.userId, 'admin', 'users')) return null;
    return Meteor.users.find({}, {fields: {_id:1, username: 1, emails:1, profile: 1, status:1, roles:1}});
  });

  Meteor.methods({
    'create-new-user'(userData) {
        // User priv check
        if(!this.userId) return null;
        if(!Roles.userIsInRole(this.userId, 'admin', 'users')) return null;
        // Check user data input
        check(userData, {
          username: String,
          email: String,
          password: String,
          passwordAgain: String,
          userType: String
        });
        // Setup user data
        userData.profile = {userType : userData.userType};
        const userType = userData.userType;
        delete userData.userType;
        delete userData.passwordAgain;
        // Create the user with role
        const newUserId = Accounts.createUser(userData);
        Roles.addUsersToRoles(newUserId, [userType], 'users');

        // Create user in discussionUserMeta
        const data = { username : userData.username };
        Meteor.call('create-user-in-discussionUserMeta', data, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
            } else {

            }
        });
    },
    'delete-user'(userId) {
      check(userId, String);
      if(!this.userId) return null;
      if(!Roles.userIsInRole(this.userId, 'admin', 'users')) return null;
      Meteor.users.remove({_id:userId})
    }
  });

  Meteor.users.find({ "status.online": true }).observe({
    added: function(id) {
      // id just came online
    },
    removed: function(id) {
      // id just went offline
    }
  });
}

if (Meteor.isClient) {
  Meteor.autorun(function () {
    if (Meteor.userId()) {
      //console.log('this user logged in');
    } else {
      FlowRouter.go('/');
      //console.log('this user logged out');
    }
  });
}
