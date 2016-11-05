(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Accounts = Package['accounts-base'].Accounts;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare, UserStatus, StatusInternals;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/mizzao_user-status/status.coffee.js                                                               //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
                                                                                                              //
/*                                                                                                            // 1
  Apparently, the new api.export takes care of issues here. No need to attach to global namespace.            //
  See http://shiggyenterprises.wordpress.com/2013/09/09/meteor-packages-in-coffeescript-0-6-5/                //
                                                                                                              //
  We may want to make UserSessions a server collection to take advantage of indices.                          //
  Will implement if someone has enough online users to warrant it.                                            //
 */                                                                                                           //
var UserConnections, activeSession, addSession, idleSession, loginSession, onStartup, removeSession, statusEvents, tryLogoutSession;                             
                                                                                                              //
UserConnections = new Mongo.Collection("user_status_sessions", {                                              // 8
  connection: null                                                                                            //
});                                                                                                           //
                                                                                                              //
statusEvents = new (Npm.require('events').EventEmitter)();                                                    // 10
                                                                                                              //
                                                                                                              //
/*                                                                                                            // 12
  Multiplex login/logout events to status.online                                                              //
                                                                                                              //
  'online' field is "true" if user is online, and "false" otherwise                                           //
                                                                                                              //
  'idle' field is tri-stated:                                                                                 //
  - "true" if user is online and not idle                                                                     //
  - "false" if user is online and idle                                                                        //
  - null if user is offline                                                                                   //
 */                                                                                                           //
                                                                                                              //
statusEvents.on("connectionLogin", function(advice) {                                                         // 22
  var conns, update;                                                                                          // 23
  update = {                                                                                                  //
    $set: {                                                                                                   //
      'status.online': true,                                                                                  //
      'status.lastLogin': {                                                                                   //
        date: advice.loginTime,                                                                               //
        ipAddr: advice.ipAddr,                                                                                //
        userAgent: advice.userAgent                                                                           //
      }                                                                                                       //
    }                                                                                                         //
  };                                                                                                          //
  conns = UserConnections.find({                                                                              //
    userId: advice.userId                                                                                     //
  }).fetch();                                                                                                 //
  if (!_.every(conns, function(c) {                                                                           //
    return c.idle;                                                                                            //
  })) {                                                                                                       //
    update.$set['status.idle'] = false;                                                                       //
    update.$unset = {                                                                                         //
      'status.lastActivity': null                                                                             //
    };                                                                                                        //
  }                                                                                                           //
  Meteor.users.update(advice.userId, update);                                                                 //
});                                                                                                           // 22
                                                                                                              //
statusEvents.on("connectionLogout", function(advice) {                                                        // 45
  var conns;                                                                                                  // 46
  conns = UserConnections.find({                                                                              //
    userId: advice.userId                                                                                     //
  }).fetch();                                                                                                 //
  if (conns.length === 0) {                                                                                   //
    Meteor.users.update(advice.userId, {                                                                      //
      $set: {                                                                                                 //
        'status.online': false                                                                                //
      },                                                                                                      //
      $unset: {                                                                                               //
        'status.idle': null,                                                                                  //
        'status.lastActivity': null                                                                           //
      }                                                                                                       //
    });                                                                                                       //
  } else if (_.every(conns, function(c) {                                                                     //
    return c.idle;                                                                                            //
  })) {                                                                                                       //
                                                                                                              //
    /*                                                                                                        // 56
      All remaining connections are idle:                                                                     //
      - If the last active connection quit, then we should go idle with the most recent activity              //
                                                                                                              //
      - If an idle connection quit, nothing should happen; specifically, if the                               //
        most recently active idle connection quit, we shouldn't tick the value backwards.                     //
        This may result in a no-op so we can be smart and skip the update.                                    //
     */                                                                                                       //
    if (advice.lastActivity != null) {                                                                        //
      return;                                                                                                 // 64
    }                                                                                                         //
    Meteor.users.update(advice.userId, {                                                                      //
      $set: {                                                                                                 //
        'status.idle': true,                                                                                  //
        'status.lastActivity': _.max(_.pluck(conns, "lastActivity"))                                          //
      }                                                                                                       //
    });                                                                                                       //
  }                                                                                                           //
});                                                                                                           // 45
                                                                                                              //
                                                                                                              //
/*                                                                                                            // 72
  Multiplex idle/active events to status.idle                                                                 //
  TODO: Hopefully this is quick because it's all in memory, but we can use indices if it turns out to be slow
                                                                                                              //
  TODO: There is a race condition when switching between tabs, leaving the user inactive while idle goes from one tab to the other.
  It can probably be smoothed out.                                                                            //
 */                                                                                                           //
                                                                                                              //
statusEvents.on("connectionIdle", function(advice) {                                                          // 79
  var conns;                                                                                                  // 80
  conns = UserConnections.find({                                                                              //
    userId: advice.userId                                                                                     //
  }).fetch();                                                                                                 //
  if (!_.every(conns, function(c) {                                                                           //
    return c.idle;                                                                                            //
  })) {                                                                                                       //
    return;                                                                                                   // 81
  }                                                                                                           //
  Meteor.users.update(advice.userId, {                                                                        //
    $set: {                                                                                                   //
      'status.idle': true,                                                                                    //
      'status.lastActivity': _.max(_.pluck(conns, "lastActivity"))                                            //
    }                                                                                                         //
  });                                                                                                         //
});                                                                                                           // 79
                                                                                                              //
statusEvents.on("connectionActive", function(advice) {                                                        // 92
  Meteor.users.update(advice.userId, {                                                                        //
    $set: {                                                                                                   //
      'status.idle': false                                                                                    //
    },                                                                                                        //
    $unset: {                                                                                                 //
      'status.lastActivity': null                                                                             //
    }                                                                                                         //
  });                                                                                                         //
});                                                                                                           // 92
                                                                                                              //
onStartup = function(selector) {                                                                              // 101
  if (selector == null) {                                                                                     //
    selector = {};                                                                                            //
  }                                                                                                           //
  return Meteor.users.update(selector, {                                                                      //
    $set: {                                                                                                   //
      "status.online": false                                                                                  //
    },                                                                                                        //
    $unset: {                                                                                                 //
      "status.idle": null,                                                                                    //
      "status.lastActivity": null                                                                             //
    }                                                                                                         //
  }, {                                                                                                        //
    multi: true                                                                                               //
  });                                                                                                         //
};                                                                                                            // 101
                                                                                                              //
                                                                                                              //
/*                                                                                                            // 114
  Local session modifification functions - also used in testing                                               //
 */                                                                                                           //
                                                                                                              //
addSession = function(connection) {                                                                           // 118
  UserConnections.upsert(connection.id, {                                                                     //
    $set: {                                                                                                   //
      ipAddr: connection.clientAddress,                                                                       //
      userAgent: connection.httpHeaders['user-agent']                                                         //
    }                                                                                                         //
  });                                                                                                         //
};                                                                                                            // 118
                                                                                                              //
loginSession = function(connection, date, userId) {                                                           // 126
  UserConnections.upsert(connection.id, {                                                                     //
    $set: {                                                                                                   //
      userId: userId,                                                                                         //
      loginTime: date                                                                                         //
    }                                                                                                         //
  });                                                                                                         //
  statusEvents.emit("connectionLogin", {                                                                      //
    userId: userId,                                                                                           //
    connectionId: connection.id,                                                                              //
    ipAddr: connection.clientAddress,                                                                         //
    userAgent: connection.httpHeaders['user-agent'],                                                          //
    loginTime: date                                                                                           //
  });                                                                                                         //
};                                                                                                            // 126
                                                                                                              //
tryLogoutSession = function(connection, date) {                                                               // 142
  var conn;                                                                                                   // 143
  if ((conn = UserConnections.findOne({                                                                       //
    _id: connection.id,                                                                                       //
    userId: {                                                                                                 //
      $exists: true                                                                                           //
    }                                                                                                         //
  })) == null) {                                                                                              //
    return false;                                                                                             // 143
  }                                                                                                           //
  UserConnections.upsert(connection.id, {                                                                     //
    $unset: {                                                                                                 //
      userId: null,                                                                                           //
      loginTime: null                                                                                         //
    }                                                                                                         //
  });                                                                                                         //
  return statusEvents.emit("connectionLogout", {                                                              //
    userId: conn.userId,                                                                                      //
    connectionId: connection.id,                                                                              //
    lastActivity: conn.lastActivity,                                                                          //
    logoutTime: date                                                                                          //
  });                                                                                                         //
};                                                                                                            // 142
                                                                                                              //
removeSession = function(connection, date) {                                                                  // 161
  tryLogoutSession(connection, date);                                                                         //
  UserConnections.remove(connection.id);                                                                      //
};                                                                                                            // 161
                                                                                                              //
idleSession = function(connection, date, userId) {                                                            // 166
  UserConnections.update(connection.id, {                                                                     //
    $set: {                                                                                                   //
      idle: true,                                                                                             //
      lastActivity: date                                                                                      //
    }                                                                                                         //
  });                                                                                                         //
  statusEvents.emit("connectionIdle", {                                                                       //
    userId: userId,                                                                                           //
    connectionId: connection.id,                                                                              //
    lastActivity: date                                                                                        //
  });                                                                                                         //
};                                                                                                            // 166
                                                                                                              //
activeSession = function(connection, date, userId) {                                                          // 179
  UserConnections.update(connection.id, {                                                                     //
    $set: {                                                                                                   //
      idle: false                                                                                             //
    },                                                                                                        //
    $unset: {                                                                                                 //
      lastActivity: null                                                                                      //
    }                                                                                                         //
  });                                                                                                         //
  statusEvents.emit("connectionActive", {                                                                     //
    userId: userId,                                                                                           //
    connectionId: connection.id,                                                                              //
    lastActivity: date                                                                                        //
  });                                                                                                         //
};                                                                                                            // 179
                                                                                                              //
                                                                                                              //
/*                                                                                                            // 190
  Handlers for various client-side events                                                                     //
 */                                                                                                           //
                                                                                                              //
Meteor.startup(onStartup);                                                                                    // 193
                                                                                                              //
Meteor.onConnection(function(connection) {                                                                    // 196
  addSession(connection);                                                                                     //
  return connection.onClose(function() {                                                                      //
    return removeSession(connection, new Date());                                                             //
  });                                                                                                         //
});                                                                                                           // 196
                                                                                                              //
Accounts.onLogin(function(info) {                                                                             // 203
  return loginSession(info.connection, new Date(), info.user._id);                                            //
});                                                                                                           // 203
                                                                                                              //
Meteor.publish(null, function() {                                                                             // 208
  if (this._session == null) {                                                                                //
    return [];                                                                                                // 211
  }                                                                                                           //
  if (this.userId == null) {                                                                                  //
    tryLogoutSession(this._session.connectionHandle, new Date());                                             //
  }                                                                                                           //
  return [];                                                                                                  // 216
});                                                                                                           // 208
                                                                                                              //
Meteor.methods({                                                                                              // 221
  "user-status-idle": function(timestamp) {                                                                   //
    var date;                                                                                                 // 223
    check(timestamp, Match.OneOf(null, void 0, Date, Number));                                                //
    date = timestamp != null ? new Date(timestamp) : new Date();                                              //
    idleSession(this.connection, date, this.userId);                                                          //
  },                                                                                                          //
  "user-status-active": function(timestamp) {                                                                 //
    var date;                                                                                                 // 230
    check(timestamp, Match.OneOf(null, void 0, Date, Number));                                                //
    date = timestamp != null ? new Date(timestamp) : new Date();                                              //
    activeSession(this.connection, date, this.userId);                                                        //
  }                                                                                                           //
});                                                                                                           //
                                                                                                              //
UserStatus = {                                                                                                // 240
  connections: UserConnections,                                                                               //
  events: statusEvents                                                                                        //
};                                                                                                            //
                                                                                                              //
StatusInternals = {                                                                                           // 245
  onStartup: onStartup,                                                                                       //
  addSession: addSession,                                                                                     //
  removeSession: removeSession,                                                                               //
  loginSession: loginSession,                                                                                 //
  tryLogoutSession: tryLogoutSession,                                                                         //
  idleSession: idleSession,                                                                                   //
  activeSession: activeSession                                                                                //
};                                                                                                            //
                                                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['mizzao:user-status'] = {}, {
  UserStatus: UserStatus,
  StatusInternals: StatusInternals
});

})();

//# sourceMappingURL=mizzao_user-status.js.map
