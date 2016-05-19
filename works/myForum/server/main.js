import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '../imports/startup/accounts.config.js';
import '../imports/api/users.api.js';
import '../imports/api/discus.api.js';


Meteor.startup(() => {
  // create admin account
  const adminUserData = {
    'username': 'Admin',
    'email': 'admin@email.com',
    'password': '123456',
    'profile': {'userType':'admin'}
  }

  if( !Meteor.users.findOne({username: 'Admin'}) ){
    const newUserId = Accounts.createUser(adminUserData);
    Roles.addUsersToRoles(newUserId, ['admin'], 'users');
    const data = {username:'Admin'};
    Meteor.call('create-user-in-unreadUserCollection', data, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
        } else {

        }
    });
    console.log('Created Admin User - Remeber to change pwd');
  }
});