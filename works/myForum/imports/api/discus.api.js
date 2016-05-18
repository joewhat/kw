import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Discussions = new Mongo.Collection('discussions');
export const Comments = new Mongo.Collection('comments');
export const UserUnread = new Mongo.Collection('userUnread');

Meteor.startup(() => {

});


if (Meteor.isServer) {
  Meteor.publish('discussions.list', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return Discussions.find({});
  });

  Meteor.publish('comments.list', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return Comments.find({});
  });

  Meteor.publish('userUnread.list', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return UserUnread.find({});
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
        'comments-insert'(data) {
            check( data, {
              comment: String,
              discussionId: String
            });

            // Make sure the user is logged in before inserting a task
            if (! Meteor.userId()) {
              throw new Meteor.Error('not-authorized');
            }else{

            }

            return Comments.insert({
              createdAt: new Date(),
              owner: Meteor.userId(),
              username: Meteor.user().username,
              discussionId: data.discussionId,
              comment: data.comment,
            });
        },
        'delete-from-userUnread'(data) {
            check( data, {
              comment: String,
              discussionId: String
            });

            // Make sure the user is logged in before inserting a task
            if (! Meteor.userId()) {
              throw new Meteor.Error('not-authorized');
            }else{

            }

            // UserUnread.remove();
        },
        'userUnread-insert'(data) {
            check( data, {
              commentId: String,
              discussionName: String
            });

            // Make sure the user is logged in before inserting a task
            if (! Meteor.userId()) {
              throw new Meteor.Error('not-authorized');
            }else{

            }

            let Allusernames = Meteor.users.find({}, {fields: {username: 1}}).fetch();
             Allusernames.forEach(function(value){
                 if(Meteor.user().username != value.username){
                     UserUnread.insert({
                         username: value.username,
                         discussionName: data.discussionName,
                         commentId: data.commentId,
                         createdAt: new Date()
                     });
                 }
            });


        },
    });
}
