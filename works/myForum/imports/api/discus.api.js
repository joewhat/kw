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
        'get-unread-comment-for-discussionId'(data){
            check( data, {
              username: String,
              discussionId: String
            });

            // const unreadComments = UnreadUserCollection.find( { username : data.username, "unreadDiscussionMeta.discussionId" : "vzu8nZZ8E7sZ4iT3d"} ).fetch();
            //  const unreadComments = UnreadUserCollection.find( { username : data.username},  {unreadDiscussionMeta: {$elemMatch:{discussionId: "vzu8nZZ8E7sZ4iT3d"}}}).fetch();
            const unreadComments = UnreadUserCollection.find( { username : data.username, "unreadDiscussionMeta.discussionId" : data.discussionId}, {fields: { "unreadDiscussionMeta.$": 1}}).fetch();

            return unreadComments[0].unreadDiscussionMeta[0].unReadCount;
            // console.log('fuckyou', unreadComments[0].unreadDiscussionMeta);
            console.log('fuckyou', unreadComments[0].unreadDiscussionMeta[0].unReadCount);
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
                       UnreadUserCollection.update(
                           { username : value.username },
                           { $push: { unreadDiscussionMeta: headerObj } }
                       );
                   }else{
                       // owner
                       UnreadUserCollection.update(
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

        },
        'remove-user-from-discussion'(data){
            check( data, {
              username: String,
            });
            Discussions.update(
                { },
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
                             UnreadUserCollection.update(
                                 { username : value.username, "unreadDiscussionMeta.discussionId" : data.discussionId,  },
                                 {$inc:{"unreadDiscussionMeta.$.unReadCount":1}}
                             );
                         }
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
