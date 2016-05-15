import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Discussions = new Mongo.Collection('discussions');

Meteor.startup(() => {

});


if (Meteor.isServer) {
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

            // Make sure the user is logged in before inserting a task
            if (! Meteor.userId()) {
              throw new Meteor.Error('not-authorized');
            }else{

            }

            Discussions.insert({
              createdAt: new Date(),
              owner: Meteor.userId(),
              username: Meteor.user().username,
              header: data.header,
              description: data.description,
              views: 0,
              comments: 0,
              latestComment: new Date()
            });

        },
    });
}
