import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Discussions = new Mongo.Collection('discussions');
export const Comments = new Mongo.Collection('comments');
export const DiscussionUserMeta = new Mongo.Collection('discussionUserMeta');

Meteor.startup(() => {

});


if (Meteor.isServer) {
  Meteor.publish('discussions.collection', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return Discussions.find({});
  });

  Meteor.publish('comments.collection', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return Comments.find({});
  });

  Meteor.publish('discussionUserMeta.collection', function () {
    // check user is loggedin
    if(!this.userId) return null;
    return DiscussionUserMeta.find({});
  });

    Meteor.methods({
        'clear-is-discussion-new'(data){
            check( data, {
              username: String,
              discussionId: String
            });

            DiscussionUserMeta.update(
                { username : data.username, "unreadDiscussionMeta.discussionId" : data.discussionId,  },
                {$set:{"unreadDiscussionMeta.$.new":false}}
            );
        },

        'is-discussion-new' : function(data){
            check( data, {
              username: String,
              discussionId: String
            });

            const unreadComments = DiscussionUserMeta.find( { username : data.username, "unreadDiscussionMeta.discussionId" : data.discussionId}, {fields: { "unreadDiscussionMeta.$": 1}}).fetch();
            return unreadComments[0].unreadDiscussionMeta[0].new;
        },
        'update-active-discussionId'(data){
            check( data, {
              username: String,
              discussionId: String
            });
            DiscussionUserMeta.update(
                { username : data.username, "unreadDiscussionMeta.discussionId" : data.discussionId,  },
                {$set:{"activeDiscussionId": data.discussionId}}
            );
        },
        'clear-unread-comment-for-discussionId'(data){
            check( data, {
              username: String,
              discussionId: String
            });

            DiscussionUserMeta.update(
                { username : data.username, "unreadDiscussionMeta.discussionId" : data.discussionId,  },
                {$set:{"unreadDiscussionMeta.$.unReadCount":0}}
            );
        },
        'get-unread-comment-for-discussionId'(data){
            check( data, {
              username: String,
              discussionId: String
            });

            const unreadComments = DiscussionUserMeta.find( { username : data.username, "unreadDiscussionMeta.discussionId" : data.discussionId}, {fields: { "unreadDiscussionMeta.$": 1}}).fetch();
            return unreadComments[0].unreadDiscussionMeta[0].unReadCount;
        },
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
              latestComment: new Date(),
              usersInDis: []
          }, function(error, _id){
              // insert unread to all users
              const Allusernames = Meteor.users.find({}, {fields: {username: 1}}).fetch();
              const headerObj = {
                  discussionId : _id,
                  discussionName : data.header,
                  unReadCount : 1,
                  new : true
              };
              const headerObjOwner = {
                  discussionId : _id,
                  discussionName : data.header,
                  unReadCount : 0,
                  new : false
              };
               Allusernames.forEach(function(value){
                   if(Meteor.user().username != value.username){
                       DiscussionUserMeta.update(
                           { username : value.username },
                           { $push: { unreadDiscussionMeta: headerObj } }
                       );
                   }else{
                       // owner
                       DiscussionUserMeta.update(
                           { username : value.username },
                           { $push: { unreadDiscussionMeta: headerObjOwner } }
                       );
                   }
              });
          });

        },
        'add-user-to-discussion'(data){
            check( data, {
              username: String,
              discussionId: String
            });
            Discussions.update(
                { _id : data.discussionId },
               { $push: { usersInDis: {username: data.username} } }
            );

            // update discussion views
            Discussions.update(
                { _id : data.discussionId },
                {$inc:{"views":1}}
            );

        },
        'remove-user-from-discussion'(data){
            check( data, {
              username: String,
              discussionId: String
            });

            Discussions.update(
                { _id : data.discussionId },
                { $pull: { usersInDis: { username: data.username } } },
                false,
                true
            );
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
                // update discussion comments
                Discussions.update(
                    { _id : data.discussionId },
                    {$inc:{"comments":1}}
                );

                // insert unread to all users
                const Allusernames = Meteor.users.find({}, {fields: {username: 1}}).fetch();
                const commentObj = {
                    commentId : _id,
                };
                const usersInDis = Discussions.find( { _id : data.discussionId }, { fields : { usersInDis : 1 } } ).fetch();
                const userInDiscussion = usersInDis[0].usersInDis.map(function(item) {
                    return item['username'];
                });

                 Allusernames.forEach(function(value){
                     if(Meteor.user().username != value.username){
                         if (userInDiscussion.indexOf(value.username) == -1) {
                             DiscussionUserMeta.update(
                                 { username : value.username, "unreadDiscussionMeta.discussionId" : data.discussionId,  },
                                 {$inc:{"unreadDiscussionMeta.$.unReadCount":1}}
                             );
                         }
                     }
                });
            });
        },
        'delete-from-discussionUserMeta'(data) {
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
        'create-user-in-discussionUserMeta'(data) {
            check( data, {
                    username : String
            });
            console.log( 'create-user-in-discussionUserMeta: ' + data.username );
            return DiscussionUserMeta.insert({
              username: data.username,
              activeDiscussionId : '',
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
                  DiscussionUserMeta.update(
                      { username : data.username },
                      { $push: { unreadDiscussionMeta: headerObj } }
                  );
              });
          });
        },
    });
}
