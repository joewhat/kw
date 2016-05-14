import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '../imports/startup/accounts.config.js';
import '../imports/api/users.api.js';


Meteor.startup(() => {
  // create admin account
  const adminUserData = {
    'username': 'admin',
    'email': 'admin@email.com',
    'password': '123456',
    'profile': {'userType':'admin'}
  }

  if( !Meteor.users.findOne({username: 'admin'}) ){
    const newUserId = Accounts.createUser(adminUserData);
    Roles.addUsersToRoles(newUserId, ['admin'], 'users');
  }
});
