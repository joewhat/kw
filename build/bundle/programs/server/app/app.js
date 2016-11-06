var require = meteorInstall({"imports":{"api":{"discus.api.js":["meteor/meteor","meteor/mongo","meteor/check","./helpers.api.js",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/discus.api.js                                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({Discussions:function(){return Discussions},Comments:function(){return Comments},DiscussionUserMeta:function(){return DiscussionUserMeta}});var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var Mongo;module.import('meteor/mongo',{"Mongo":function(v){Mongo=v}});var check;module.import('meteor/check',{"check":function(v){check=v}});var helpers;module.import('./helpers.api.js',{"default":function(v){helpers=v}});
                                                                                                                      // 2
                                                                                                                      // 3
                                                                                                                      // 4
                                                                                                                      //
var Discussions = new Mongo.Collection('discussions');                                                                // 6
var Comments = new Mongo.Collection('comments');                                                                      // 7
var DiscussionUserMeta = new Mongo.Collection('discussionUserMeta');                                                  // 8
                                                                                                                      //
Meteor.startup(function () {});                                                                                       // 10
                                                                                                                      //
if (Meteor.isServer) {                                                                                                // 14
  (function () {                                                                                                      // 14
                                                                                                                      //
    // index Discussions                                                                                              // 16
    Discussions._ensureIndex({ header: 1, createdAt: 1, latestComment: 1, username: 1 });                             // 17
    var MAX_DIS = 1000;                                                                                               // 18
                                                                                                                      //
    Meteor.publish('discussions.collection', function () {                                                            // 20
      var searchQuery = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';                       // 20
      var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30;                             // 20
                                                                                                                      //
      check(searchQuery, Match.OneOf(String, null, undefined));                                                       // 21
      check(limit, Number);                                                                                           // 22
                                                                                                                      //
      var query = {};                                                                                                 // 24
      var queryOptions = {};                                                                                          // 25
                                                                                                                      //
      if (searchQuery) {                                                                                              // 27
        var regex = new RegExp(helpers.regexMultiWordsSearch(searchQuery), 'i');                                      // 28
        query = {                                                                                                     // 29
          header: regex                                                                                               // 30
        };                                                                                                            // 29
        queryOptions = {                                                                                              // 32
          sort: { createdAt: 1 },                                                                                     // 33
          limit: Math.min(limit, MAX_DIS)                                                                             // 34
        };                                                                                                            // 32
      } else {                                                                                                        // 36
        queryOptions = {                                                                                              // 37
          sort: { latestComment: -1 },                                                                                // 38
          limit: Math.min(limit, MAX_DIS)                                                                             // 39
        };                                                                                                            // 37
      }                                                                                                               // 41
                                                                                                                      //
      return Discussions.find(query, queryOptions);                                                                   // 43
    });                                                                                                               // 44
                                                                                                                      //
    Meteor.publish('comments.collection', function (id) {                                                             // 47
      var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;                              // 47
                                                                                                                      //
      check(id, String);                                                                                              // 48
      check(limit, Number);                                                                                           // 49
      console.log('comment litmit: ', limit);                                                                         // 50
      // check user is loggedin                                                                                       // 51
      if (!this.userId) return null;                                                                                  // 52
                                                                                                                      //
      var query = {};                                                                                                 // 54
      var queryOptions = {};                                                                                          // 55
                                                                                                                      //
      query = {                                                                                                       // 58
        discussionId: id                                                                                              // 59
      };                                                                                                              // 58
                                                                                                                      //
      var commentLength = Comments.find(query).count();                                                               // 62
      // console.log('commentLength: ', commentLength);                                                               // 63
                                                                                                                      //
      queryOptions = {                                                                                                // 65
        sort: { createdAt: -1 },                                                                                      // 66
        limit: Math.min(limit, MAX_DIS)                                                                               // 67
      };                                                                                                              // 65
                                                                                                                      //
      return Comments.find(query, queryOptions);                                                                      // 70
    });                                                                                                               // 71
                                                                                                                      //
    Meteor.publish('discussionUserMeta.collection', function () {                                                     // 73
      // check user is loggedin                                                                                       // 74
      if (!this.userId) return null;                                                                                  // 75
      return DiscussionUserMeta.find({});                                                                             // 76
    });                                                                                                               // 77
                                                                                                                      //
    Meteor.methods({                                                                                                  // 79
      'clear-is-discussion-new': function () {                                                                        // 80
        function clearIsDiscussionNew(data) {                                                                         // 79
          check(data, {                                                                                               // 81
            username: String,                                                                                         // 82
            discussionId: String                                                                                      // 83
          });                                                                                                         // 81
                                                                                                                      //
          DiscussionUserMeta.update({ username: data.username, "unreadDiscussionMeta.discussionId": data.discussionId }, { $set: { "unreadDiscussionMeta.$.new": false } });
        }                                                                                                             // 90
                                                                                                                      //
        return clearIsDiscussionNew;                                                                                  // 79
      }(),                                                                                                            // 79
      'dicsussion-total-count': function () {                                                                         // 92
        function dicsussionTotalCount(data) {                                                                         // 79
          return Discussions.find({}).count();                                                                        // 93
        }                                                                                                             // 94
                                                                                                                      //
        return dicsussionTotalCount;                                                                                  // 79
      }(),                                                                                                            // 79
                                                                                                                      //
                                                                                                                      //
      'is-discussion-new': function () {                                                                              // 96
        function isDiscussionNew(data) {                                                                              // 96
          check(data, {                                                                                               // 97
            username: String,                                                                                         // 98
            discussionId: String                                                                                      // 99
          });                                                                                                         // 97
                                                                                                                      //
          var unreadComments = DiscussionUserMeta.find({ username: data.username, "unreadDiscussionMeta.discussionId": data.discussionId }, { fields: { "unreadDiscussionMeta.$": 1 } }).fetch();
          return unreadComments[0].unreadDiscussionMeta[0]['new'];                                                    // 103
        }                                                                                                             // 104
                                                                                                                      //
        return isDiscussionNew;                                                                                       // 96
      }(),                                                                                                            // 96
      'update-active-discussionId': function () {                                                                     // 105
        function updateActiveDiscussionId(data) {                                                                     // 79
          check(data, {                                                                                               // 106
            username: String,                                                                                         // 107
            discussionId: String                                                                                      // 108
          });                                                                                                         // 106
          DiscussionUserMeta.update({ username: data.username, "unreadDiscussionMeta.discussionId": data.discussionId }, { $set: { "activeDiscussionId": data.discussionId } });
        }                                                                                                             // 114
                                                                                                                      //
        return updateActiveDiscussionId;                                                                              // 79
      }(),                                                                                                            // 79
      'clear-unread-comment-for-discussionId': function () {                                                          // 115
        function clearUnreadCommentForDiscussionId(data) {                                                            // 79
          check(data, {                                                                                               // 116
            username: String,                                                                                         // 117
            discussionId: String                                                                                      // 118
          });                                                                                                         // 116
                                                                                                                      //
          DiscussionUserMeta.update({ username: data.username, "unreadDiscussionMeta.discussionId": data.discussionId }, { $set: { "unreadDiscussionMeta.$.unReadCount": 0 } });
        }                                                                                                             // 125
                                                                                                                      //
        return clearUnreadCommentForDiscussionId;                                                                     // 79
      }(),                                                                                                            // 79
      'get-unread-comment-for-discussionId': function () {                                                            // 126
        function getUnreadCommentForDiscussionId(data) {                                                              // 79
          check(data, {                                                                                               // 127
            username: String,                                                                                         // 128
            discussionId: String                                                                                      // 129
          });                                                                                                         // 127
                                                                                                                      //
          var unreadComments = DiscussionUserMeta.find({ username: data.username, "unreadDiscussionMeta.discussionId": data.discussionId }, { fields: { "unreadDiscussionMeta.$": 1 } }).fetch();
          return unreadComments[0].unreadDiscussionMeta[0].unReadCount;                                               // 133
        }                                                                                                             // 134
                                                                                                                      //
        return getUnreadCommentForDiscussionId;                                                                       // 79
      }(),                                                                                                            // 79
                                                                                                                      //
                                                                                                                      //
      // create new dicsussion                                                                                        // 136
      'discussions-insert': function () {                                                                             // 137
        function discussionsInsert(data) {                                                                            // 79
          check(data, {                                                                                               // 138
            header: String,                                                                                           // 139
            description: String                                                                                       // 140
          });                                                                                                         // 138
                                                                                                                      //
          // Make sure the user is logged in before inserting a dis                                                   // 143
          if (!Meteor.userId()) {                                                                                     // 144
            throw new Meteor.Error('not-authorized');                                                                 // 145
          } else {}                                                                                                   // 146
          // check if discussion exitst                                                                               // 149
          var disExist = Discussions.findOne({ header: data.header }, { fields: { header: 1 } });                     // 150
                                                                                                                      //
          if (!disExist) {                                                                                            // 153
            return Discussions.insert({                                                                               // 154
              createdAt: new Date(),                                                                                  // 155
              owner: Meteor.userId(),                                                                                 // 156
              username: Meteor.user().username,                                                                       // 157
              header: data.header,                                                                                    // 158
              description: data.description,                                                                          // 159
              views: 0,                                                                                               // 160
              comments: 0,                                                                                            // 161
              latestComment: new Date(),                                                                              // 162
              usersInDis: []                                                                                          // 163
            }, function (error, _id) {                                                                                // 154
              // insert unread to all users                                                                           // 165
              var Allusernames = Meteor.users.find({}, { fields: { username: 1 } }).fetch();                          // 166
              var headerObj = {                                                                                       // 167
                discussionId: _id,                                                                                    // 168
                discussionName: data.header,                                                                          // 169
                unReadCount: 1,                                                                                       // 170
                'new': true                                                                                           // 171
              };                                                                                                      // 167
              var headerObjOwner = {                                                                                  // 173
                discussionId: _id,                                                                                    // 174
                discussionName: data.header,                                                                          // 175
                unReadCount: 0,                                                                                       // 176
                'new': false                                                                                          // 177
              };                                                                                                      // 173
              Allusernames.forEach(function (value) {                                                                 // 179
                if (Meteor.user().username != value.username) {                                                       // 180
                  DiscussionUserMeta.update({ username: value.username }, { $push: { unreadDiscussionMeta: headerObj } });
                } else {                                                                                              // 185
                  // owner                                                                                            // 186
                  DiscussionUserMeta.update({ username: value.username }, { $push: { unreadDiscussionMeta: headerObjOwner } });
                }                                                                                                     // 191
              });                                                                                                     // 192
            });                                                                                                       // 193
          }                                                                                                           // 194
        }                                                                                                             // 195
                                                                                                                      //
        return discussionsInsert;                                                                                     // 79
      }(),                                                                                                            // 79
      'add-user-to-discussion': function () {                                                                         // 196
        function addUserToDiscussion(data) {                                                                          // 79
          check(data, {                                                                                               // 197
            username: String,                                                                                         // 198
            discussionId: String                                                                                      // 199
          });                                                                                                         // 197
          // Discussions.update(                                                                                      // 201
          //     { _id : data.discussionId },                                                                         // 202
          //    { $push: { usersInDis: {username: data.username} } }                                                  // 203
          // );                                                                                                       // 204
                                                                                                                      //
          // update discussion views                                                                                  // 206
          Discussions.update({ _id: data.discussionId }, { $inc: { "views": 1 } });                                   // 207
        }                                                                                                             // 212
                                                                                                                      //
        return addUserToDiscussion;                                                                                   // 79
      }(),                                                                                                            // 79
      'remove-user-from-discussion': function () {                                                                    // 213
        function removeUserFromDiscussion(data) {                                                                     // 79
          check(data, {                                                                                               // 214
            username: String,                                                                                         // 215
            discussionId: String                                                                                      // 216
          });                                                                                                         // 214
                                                                                                                      //
          // Discussions.update(                                                                                      // 219
          //     { _id : data.discussionId },                                                                         // 220
          //     { $pull: { usersInDis: { username: data.username } } },                                              // 221
          //     false,                                                                                               // 222
          //     true                                                                                                 // 223
          // );                                                                                                       // 224
        }                                                                                                             // 225
                                                                                                                      //
        return removeUserFromDiscussion;                                                                              // 79
      }(),                                                                                                            // 79
      'comments-insert': function () {                                                                                // 226
        function commentsInsert(data) {                                                                               // 79
          check(data, {                                                                                               // 227
            comment: String,                                                                                          // 228
            discussionId: String                                                                                      // 229
          });                                                                                                         // 227
                                                                                                                      //
          // Make sure the user is logged in before inserting a task                                                  // 232
          if (!Meteor.userId()) {                                                                                     // 233
            throw new Meteor.Error('not-authorized');                                                                 // 234
          } else {}                                                                                                   // 235
                                                                                                                      //
          return Comments.insert({                                                                                    // 239
            createdAt: new Date(),                                                                                    // 240
            owner: Meteor.userId(),                                                                                   // 241
            username: Meteor.user().username,                                                                         // 242
            discussionId: data.discussionId,                                                                          // 243
            comment: data.comment                                                                                     // 244
          }, function (error, _id) {                                                                                  // 239
            // update discussion comments                                                                             // 246
            Discussions.update({ _id: data.discussionId }, {                                                          // 247
              $inc: { "comments": 1 },                                                                                // 250
              $set: { latestComment: new Date() }                                                                     // 251
            });                                                                                                       // 249
                                                                                                                      //
            // insert unread to all users                                                                             // 255
            var Allusernames = Meteor.users.find({}, { fields: { username: 1 } }).fetch();                            // 256
            var commentObj = {                                                                                        // 257
              commentId: _id                                                                                          // 258
            };                                                                                                        // 257
            var usersInDis = Discussions.find({ _id: data.discussionId }, { fields: { usersInDis: 1 } }).fetch();     // 260
            var userInDiscussion = usersInDis[0].usersInDis.map(function (item) {                                     // 261
              return item['username'];                                                                                // 262
            });                                                                                                       // 263
                                                                                                                      //
            Allusernames.forEach(function (value) {                                                                   // 265
              if (Meteor.user().username != value.username) {                                                         // 266
                if (userInDiscussion.indexOf(value.username) == -1) {                                                 // 267
                  DiscussionUserMeta.update({ username: value.username, "unreadDiscussionMeta.discussionId": data.discussionId }, { $inc: { "unreadDiscussionMeta.$.unReadCount": 1 } });
                }                                                                                                     // 272
              }                                                                                                       // 273
            });                                                                                                       // 274
          });                                                                                                         // 275
        }                                                                                                             // 276
                                                                                                                      //
        return commentsInsert;                                                                                        // 79
      }(),                                                                                                            // 79
      'delete-from-discussionUserMeta': function () {                                                                 // 277
        function deleteFromDiscussionUserMeta(data) {                                                                 // 79
          check(data, {                                                                                               // 278
            comment: String,                                                                                          // 279
            discussionId: String                                                                                      // 280
          });                                                                                                         // 278
                                                                                                                      //
          // Make sure the user is logged in before inserting a task                                                  // 283
          if (!Meteor.userId()) {                                                                                     // 284
            throw new Meteor.Error('not-authorized');                                                                 // 285
          } else {}                                                                                                   // 286
                                                                                                                      //
          // UserUnread.remove();                                                                                     // 290
        }                                                                                                             // 291
                                                                                                                      //
        return deleteFromDiscussionUserMeta;                                                                          // 79
      }(),                                                                                                            // 79
      'create-user-in-discussionUserMeta': function () {                                                              // 292
        function createUserInDiscussionUserMeta(data) {                                                               // 79
          check(data, {                                                                                               // 293
            username: String                                                                                          // 294
          });                                                                                                         // 293
          console.log('create-user-in-discussionUserMeta: ' + data.username);                                         // 296
          return DiscussionUserMeta.insert({                                                                          // 297
            username: data.username,                                                                                  // 298
            activeDiscussionId: '',                                                                                   // 299
            unreadDiscussionMeta: []                                                                                  // 300
          }, function (error, _id) {                                                                                  // 297
            // create all discussions in user record                                                                  // 302
            var headers = Discussions.find({}, { fields: { header: 1 } }).fetch();                                    // 303
            headers.forEach(function (value) {                                                                        // 304
              var headerObj = {                                                                                       // 305
                discussionId: value._id,                                                                              // 306
                discussionName: value.header,                                                                         // 307
                unReadCount: 0,                                                                                       // 308
                'new': false                                                                                          // 309
                                                                                                                      //
              };                                                                                                      // 305
              DiscussionUserMeta.update({ username: data.username }, { $push: { unreadDiscussionMeta: headerObj } });
            });                                                                                                       // 316
          });                                                                                                         // 317
        }                                                                                                             // 318
                                                                                                                      //
        return createUserInDiscussionUserMeta;                                                                        // 79
      }(),                                                                                                            // 79
      'discussionExists': function () {                                                                               // 320
        function discussionExists(val) {                                                                              // 79
          check(val, String);                                                                                         // 321
          return Discussions.findOne({ header: val }, { fields: { header: 1 } });                                     // 322
        }                                                                                                             // 323
                                                                                                                      //
        return discussionExists;                                                                                      // 79
      }()                                                                                                             // 79
    });                                                                                                               // 79
  })();                                                                                                               // 14
}                                                                                                                     // 326
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"helpers.api.js":["meteor/meteor","meteor/check",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/helpers.api.js                                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var check;module.import('meteor/check',{"check":function(v){check=v}});
                                                                                                                      // 2
                                                                                                                      //
if (Meteor.isClient) {                                                                                                // 4
    module.exports = {                                                                                                // 5
        stringMatch: function () {                                                                                    // 6
            function stringMatch(strOrigin, strNew) {                                                                 // 6
                if (strOrigin === strNew) {                                                                           // 7
                    return true;                                                                                      // 8
                } else {                                                                                              // 9
                    return false;                                                                                     // 10
                }                                                                                                     // 11
            }                                                                                                         // 12
                                                                                                                      //
            return stringMatch;                                                                                       // 6
        }(),                                                                                                          // 6
        regexMultiWordsSearch: function () {                                                                          // 13
            function regexMultiWordsSearch(searchString) {                                                            // 13
                // turns "hej med dig" into "hej|med|dig"                                                             // 14
                return searchString.match(/\S+/g).toString().replace(/\,/g, '|');                                     // 15
            }                                                                                                         // 16
                                                                                                                      //
            return regexMultiWordsSearch;                                                                             // 13
        }(),                                                                                                          // 13
        convertDate: function () {                                                                                    // 17
            function convertDate(date) {                                                                              // 17
                var hours = date.getHours();                                                                          // 18
                var minutes = date.getMinutes();                                                                      // 19
                var secs = date.getSeconds().toString();                                                              // 20
                secs = secs.length > 1 ? secs : '0' + secs;                                                           // 21
                var year = date.getFullYear();                                                                        // 22
                var month = (1 + date.getMonth()).toString();                                                         // 23
                month = month.length > 1 ? month : '0' + month;                                                       // 24
                var day = date.getDate().toString();                                                                  // 25
                day = day.length > 1 ? day : '0' + day;                                                               // 26
                return year + '.' + month + '.' + day + '-' + hours + ':' + minutes + ':' + secs;                     // 27
            }                                                                                                         // 28
                                                                                                                      //
            return convertDate;                                                                                       // 17
        }()                                                                                                           // 17
    };                                                                                                                // 5
} else if (Meteor.isServer) {                                                                                         // 30
    module.exports = {                                                                                                // 31
        stringMatch: function () {                                                                                    // 32
            function stringMatch(strOrigin, strNew) {                                                                 // 32
                if (strOrigin === strNew) {                                                                           // 33
                    return true;                                                                                      // 34
                } else {                                                                                              // 35
                    return false;                                                                                     // 36
                }                                                                                                     // 37
            }                                                                                                         // 38
                                                                                                                      //
            return stringMatch;                                                                                       // 32
        }(),                                                                                                          // 32
        regexMultiWordsSearch: function () {                                                                          // 39
            function regexMultiWordsSearch(searchString) {                                                            // 39
                // turns "hej med dig" into "hej|med|dig"                                                             // 40
                return searchString.match(/\S+/g).toString().replace(/\,/g, '|');                                     // 41
            }                                                                                                         // 42
                                                                                                                      //
            return regexMultiWordsSearch;                                                                             // 39
        }(),                                                                                                          // 39
        convertDate: function () {                                                                                    // 43
            function convertDate(date) {                                                                              // 43
                var year = date.getFullYear();                                                                        // 44
                var month = (1 + date.getMonth()).toString();                                                         // 45
                month = month.length > 1 ? month : '0' + month;                                                       // 46
                var day = date.getDate().toString();                                                                  // 47
                day = day.length > 1 ? day : '0' + day;                                                               // 48
                return year + '.' + month + '.' + day;                                                                // 49
            }                                                                                                         // 50
                                                                                                                      //
            return convertDate;                                                                                       // 43
        }()                                                                                                           // 43
    };                                                                                                                // 31
}                                                                                                                     // 52
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"upload.api.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/upload.api.js                                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({Images:function(){return Images}});var Images = new Meteor.Files({                                     // 1
  debug: true,                                                                                                        // 2
  collectionName: 'Images',                                                                                           // 3
  allowClientCode: false, // Disallow remove files from Client                                                        // 4
  storagePath: '/webapp/uploads',                                                                                     // 5
  'protected': true,                                                                                                  // 6
  onBeforeUpload: function () {                                                                                       // 7
    function onBeforeUpload(file) {                                                                                   // 7
      // Allow upload files under 10MB, and only in png/jpg/jpeg formats                                              // 8
      if (file.size <= 1024 * 1024 * 3 && /png|jpg|jpeg/i.test(file.extension)) {                                     // 9
        return true;                                                                                                  // 10
      } else {                                                                                                        // 11
        return 'Please upload image, with size equal or less than 3MB';                                               // 12
      }                                                                                                               // 13
    }                                                                                                                 // 14
                                                                                                                      //
    return onBeforeUpload;                                                                                            // 7
  }()                                                                                                                 // 7
});                                                                                                                   // 1
                                                                                                                      //
if (Meteor.isServer) {                                                                                                // 17
  Images.denyClient();                                                                                                // 18
  Meteor.publish('files.images.all', function () {                                                                    // 19
    return Images.find().cursor;                                                                                      // 20
  });                                                                                                                 // 21
}                                                                                                                     // 22
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"users.api.js":["meteor/meteor","meteor/accounts-base","meteor/check","./discus.api.js",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/api/users.api.js                                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var Accounts;module.import('meteor/accounts-base',{"Accounts":function(v){Accounts=v}});var check;module.import('meteor/check',{"check":function(v){check=v}});module.import('./discus.api.js');
                                                                                                                      // 2
                                                                                                                      // 3
                                                                                                                      //
                                                                                                                      // 5
                                                                                                                      //
if (Meteor.isServer) {                                                                                                // 7
  Meteor.publish('user.list', function () {                                                                           // 8
    // check if user is logged in                                                                                     // 9
    if (!this.userId) return null;                                                                                    // 10
    if (!Roles.userIsInRole(this.userId, 'admin', 'users')) return null;                                              // 11
    return Meteor.users.find({}, { fields: { _id: 1, username: 1, emails: 1, profile: 1, status: 1, roles: 1 } });    // 12
  });                                                                                                                 // 13
                                                                                                                      //
  Meteor.methods({                                                                                                    // 15
    'create-new-user': function () {                                                                                  // 16
      function createNewUser(userData) {                                                                              // 15
        // User priv check                                                                                            // 17
        if (!this.userId) return null;                                                                                // 18
        if (!Roles.userIsInRole(this.userId, 'admin', 'users')) return null;                                          // 19
        // Check user data input                                                                                      // 20
        check(userData, {                                                                                             // 21
          username: String,                                                                                           // 22
          email: String,                                                                                              // 23
          password: String,                                                                                           // 24
          passwordAgain: String,                                                                                      // 25
          userType: String                                                                                            // 26
        });                                                                                                           // 21
        // Setup user data                                                                                            // 28
        userData.profile = { userType: userData.userType };                                                           // 29
        var userType = userData.userType;                                                                             // 30
        delete userData.userType;                                                                                     // 31
        delete userData.passwordAgain;                                                                                // 32
        // Create the user with role                                                                                  // 33
        var newUserId = Accounts.createUser(userData);                                                                // 34
        Roles.addUsersToRoles(newUserId, [userType], 'users');                                                        // 35
                                                                                                                      //
        // Create user in discussionUserMeta                                                                          // 37
        var data = { username: userData.username };                                                                   // 38
        Meteor.call('create-user-in-discussionUserMeta', data, function (error, response) {                           // 39
          if (error) {                                                                                                // 40
            // Handle our error.                                                                                      // 41
            console.log('wtf: ' + error);                                                                             // 42
          } else {}                                                                                                   // 43
        });                                                                                                           // 46
      }                                                                                                               // 47
                                                                                                                      //
      return createNewUser;                                                                                           // 15
    }(),                                                                                                              // 15
    'delete-user': function () {                                                                                      // 48
      function deleteUser(userId) {                                                                                   // 15
        check(userId, String);                                                                                        // 49
        if (!this.userId) return null;                                                                                // 50
        if (!Roles.userIsInRole(this.userId, 'admin', 'users')) return null;                                          // 51
        Meteor.users.remove({ _id: userId });                                                                         // 52
      }                                                                                                               // 53
                                                                                                                      //
      return deleteUser;                                                                                              // 15
    }()                                                                                                               // 15
  });                                                                                                                 // 15
                                                                                                                      //
  Meteor.users.find({ "status.online": true }).observe({                                                              // 56
    added: function () {                                                                                              // 57
      function added(id) {                                                                                            // 57
        // id just came online                                                                                        // 58
      }                                                                                                               // 59
                                                                                                                      //
      return added;                                                                                                   // 57
    }(),                                                                                                              // 57
    removed: function () {                                                                                            // 60
      function removed(id) {                                                                                          // 60
        // id just went offline                                                                                       // 61
      }                                                                                                               // 62
                                                                                                                      //
      return removed;                                                                                                 // 60
    }()                                                                                                               // 60
  });                                                                                                                 // 56
}                                                                                                                     // 64
                                                                                                                      //
if (Meteor.isClient) {                                                                                                // 66
  Meteor.autorun(function () {                                                                                        // 67
    if (Meteor.userId()) {                                                                                            // 68
      // console.log('this user logged in');                                                                          // 69
      BlazeLayout.render('mainLayout', { layer1: 'mainPageTemplate' });                                               // 70
    } else {                                                                                                          // 71
      FlowRouter.go('/');                                                                                             // 72
      // console.log('this user logged out');                                                                         // 73
    }                                                                                                                 // 74
  });                                                                                                                 // 75
}                                                                                                                     // 76
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]},"startup":{"accounts.config.js":["meteor/accounts-base",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// imports/startup/accounts.config.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Accounts;module.import('meteor/accounts-base',{"Accounts":function(v){Accounts=v}});                              // 1
                                                                                                                      //
if (Meteor.isClient) {                                                                                                // 3
  Accounts.ui.config({                                                                                                // 4
    passwordSignupFields: 'USERNAME_ONLY'                                                                             // 5
  });                                                                                                                 // 4
  Accounts.config({                                                                                                   // 7
    forbidClientAccountCreation: true                                                                                 // 8
  });                                                                                                                 // 7
}                                                                                                                     // 10
                                                                                                                      //
if (Meteor.isServer) {                                                                                                // 13
  Accounts.config({                                                                                                   // 14
    forbidClientAccountCreation: true                                                                                 // 15
  });                                                                                                                 // 14
}                                                                                                                     // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}},"server":{"main.js":["meteor/meteor","meteor/accounts-base","../imports/api/discus.api.js","../imports/startup/accounts.config.js","../imports/api/users.api.js","../imports/api/upload.api.js",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// server/main.js                                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});var Accounts;module.import('meteor/accounts-base',{"Accounts":function(v){Accounts=v}});var Discussions;module.import('../imports/api/discus.api.js',{"Discussions":function(v){Discussions=v}});var DiscussionUserMeta;module.import('../imports/api/discus.api.js',{"DiscussionUserMeta":function(v){DiscussionUserMeta=v}});module.import('../imports/startup/accounts.config.js');module.import('../imports/api/users.api.js');module.import('../imports/api/discus.api.js');module.import('../imports/api/upload.api.js');
                                                                                                                      // 2
                                                                                                                      // 3
                                                                                                                      // 4
                                                                                                                      // 5
                                                                                                                      // 6
                                                                                                                      // 7
                                                                                                                      // 8
                                                                                                                      //
Meteor.startup(function () {                                                                                          // 11
  // create admin account                                                                                             // 12
  var adminUserData = {                                                                                               // 13
    'username': 'Admin',                                                                                              // 14
    'email': 'admin@email.com',                                                                                       // 15
    'password': '123456',                                                                                             // 16
    'profile': { 'userType': 'admin' }                                                                                // 17
  };                                                                                                                  // 13
                                                                                                                      //
  if (!Meteor.users.findOne({ username: 'Admin' })) {                                                                 // 20
    var newUserId = Accounts.createUser(adminUserData);                                                               // 21
    Roles.addUsersToRoles(newUserId, ['admin'], 'users');                                                             // 22
    var data = { username: 'Admin' };                                                                                 // 23
    Meteor.call('create-user-in-discussionUserMeta', data, function (error, response) {                               // 24
      if (error) {                                                                                                    // 25
        // Handle our error.                                                                                          // 26
        console.log('wtf: ' + error);                                                                                 // 27
      } else {}                                                                                                       // 28
    });                                                                                                               // 31
    console.log('Created Admin User - Remeber to change pwd');                                                        // 32
  }                                                                                                                   // 33
                                                                                                                      //
  // generate demo discussions                                                                                        // 35
  var createShit = false;                                                                                             // 36
  var sizeOfshit = 500;                                                                                               // 37
  if (createShit) {                                                                                                   // 38
                                                                                                                      //
    for (var i = 0; i < sizeOfshit; i++) {                                                                            // 40
                                                                                                                      //
      var header = 'data.header ' + i;                                                                                // 42
      var disExist = Discussions.findOne({ header: header }, { fields: { header: 1 } });                              // 43
      if (!disExist) {                                                                                                // 45
        console.log('create demo dis: ', header);                                                                     // 46
                                                                                                                      //
        Discussions.insert({                                                                                          // 48
          createdAt: new Date(),                                                                                      // 49
          owner: '1234',                                                                                              // 50
          username: 'test',                                                                                           // 51
          header: header,                                                                                             // 52
          description: 'data.description',                                                                            // 53
          views: 0,                                                                                                   // 54
          comments: 0,                                                                                                // 55
          latestComment: new Date(),                                                                                  // 56
          usersInDis: []                                                                                              // 57
        });                                                                                                           // 48
      }                                                                                                               // 59
    }                                                                                                                 // 60
  }                                                                                                                   // 61
});                                                                                                                   // 62
                                                                                                                      //
UserStatus.events.on("connectionLogout", function (fields) {                                                          // 64
  // remove user from Discussions collection userInDis                                                                // 65
  // console.log(fields.userId);                                                                                      // 66
  var user = Meteor.users.findOne(fields.userId);                                                                     // 67
  var data = {                                                                                                        // 68
    username: user.username,                                                                                          // 69
    discussionId: DiscussionUserMeta.find({ username: user.username }).fetch()[0].activeDiscussionId                  // 70
  };                                                                                                                  // 68
  Meteor.call('remove-user-from-discussion', data, function (error, response) {                                       // 72
    if (error) {                                                                                                      // 73
      // Handle our error.                                                                                            // 74
      console.log('wtf: ' + error);                                                                                   // 75
    } else {}                                                                                                         // 76
  });                                                                                                                 // 78
});                                                                                                                   // 79
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}},{"extensions":[".js",".json"]});
require("./server/main.js");
//# sourceMappingURL=app.js.map
