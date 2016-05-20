import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Discussions = new Mongo.Collection('discussions');
export const Comments = new Mongo.Collection('comments');
export const UnreadUserCollection = new Mongo.Collection('unreadUserCollection');

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
    return UnreadUserCollection.find({});
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
          }, function(error, _id){
              // insert unread to all users
              const Allusernames = Meteor.users.find({}, {fields: {username: 1}}).fetch();
              const headerObj = {
                  discussionId : _id,
                  discussionName : data.header,
                  unReadCount : 1,
                  new : true
              };
               Allusernames.forEach(function(value){
                   if(Meteor.user().username != value.username){
                       UnreadUserCollection.update(
                           { username : value.username },
                           { $push: { unreadDiscussionMeta: headerObj } }
                       );
                   }
              });
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
            }, function(error, _id){
                // insert unread to all users
                const Allusernames = Meteor.users.find({}, {fields: {username: 1}}).fetch();
                const commentObj = {
                    commentId : _id,
                };
                 Allusernames.forEach(function(value){
                     if(Meteor.user().username != value.username){
                         UnreadUserCollection.update(
                             { username : value.username, "unread.discussionId" : data.discussionId,  },
                            //  { unread : [{}value.username] },
                             { $push: { comments: commentObj } }
                         );
                         console.log('updading unread comments, ');
                     }
                });
            });
        },
        'delete-from-unreadUserCollection'(data) {
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
        'create-user-in-unreadUserCollection'(data) {
            check( data, {
                    username : String
            });
            console.log( 'create-user-in-unreadUserCollection: ' + data.username );
            return UnreadUserCollection.insert({
              username: data.username,
              unreadDiscussionMeta : []
            }, function(error, _id){
              // create all discussions in user record
              const headers = Discussions.find( {}, { fields: { header:1 } } ).fetch();
              headers.forEach(function(value){
                  const headerObj = {
                      discussionId : value._id,
                      discussionName : value.header,
                      unReadCount : 0,
                      new : false
                  };
                  UnreadUserCollection.update(
                      { username : data.username },
                      { $push: { unreadDiscussionMeta: headerObj } }
                  );
              });
          });
        },
    });
}
