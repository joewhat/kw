import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';


export const Discussions = new Mongo.Collection('discussions');

Meteor.startup(() => {
    console.log('startup discus');
});


if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('discussions.list', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return Discussions.find({});
  });

    Meteor.methods({
        'discussions-insert'(data) {
            check( data, {
              header: String,
              description: String
            });

            console.log('header: ' + data.header);
            console.log('description: ' + data.description);
            // Make sure the user is logged in before inserting a task
            if (! Meteor.userId()) {
              throw new Meteor.Error('not-authorized');
            }

            Discussions.insert({
              createdAt: new Date(),
              owner: Meteor.userId(),
              username: Meteor.user().username,
              header: data.header,
              description: data.description
            });

        },
    });
}
