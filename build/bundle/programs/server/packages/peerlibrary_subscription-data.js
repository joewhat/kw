(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var assert = Package['peerlibrary:assert'].assert;
var DataLookup = Package['peerlibrary:data-lookup'].DataLookup;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var check = Package.check.check;
var Match = Package.check.Match;

/* Package-scope variables */
var __coffeescriptShare;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/peerlibrary_subscription-data/packages/peerlibrary_subscription-data.js       //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
(function () {

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/peerlibrary:subscription-data/lib.coffee.js                                //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var SUBSCRIPTION_ID_REGEX, checkPath, checkSubscriptionDataId;

checkPath = function(path) {
  var field, update, value;
  if (_.isString(path)) {
    check(path, Match.NonEmptyString);
    if (path === '_id' || path === '_connectionId') {
      throw new Match.Error("Cannot modify '" + path + "'.");
    }
  } else {
    update = path;
    check(update, Object);
    for (field in update) {
      value = update[field];
      if (field === '_id' || field === '_connectionId') {
        throw new Match.Error("Cannot modify '" + field + "'.");
      }
      if (field[0] === '$') {
        throw new Match.Error("Invalid field name '" + field + "'.");
      }
    }
  }
  return true;
};

checkSubscriptionDataId = function(subscriptionDataId) {
  var splits;
  check(subscriptionDataId, Match.NonEmptyString);
  splits = subscriptionDataId.split('_');
  if (splits.length !== 2) {
    throw new Match.Error("Invalid subscriptionDataId '" + subscriptionDataId + "'.");
  }
  check(splits[0], Match.DocumentId);
  check(splits[1], Match.DocumentId);
  return true;
};

SUBSCRIPTION_ID_REGEX = /_.+?$/;

share.handleMethods = function(connection, collection, subscriptionDataId) {
  return {
    data: function(path, equalsFunc) {
      var fields, getData;
      getData = function(fields) {
        var data;
        data = collection.findOne(subscriptionDataId, {
          fields: fields
        });
        if (!data) {
          return data;
        }
        return _.omit(data, '_id', '_connectionId');
      };
      if (path != null) {
        if (_.isString(path)) {
          fields = {};
          fields[path] = 1;
        } else {
          fields = {
            _connectionId: 0
          };
        }
        return DataLookup.get(function() {
          return getData(fields);
        }, path, equalsFunc);
      } else {
        return getData({
          _connectionId: 0
        });
      }
    },
    setData: function(path, value) {
      var args;
      if (value === void 0) {
        args = [subscriptionDataId, path];
      } else {
        args = [subscriptionDataId, path, value];
      }
      return connection.apply('_subscriptionDataSet', args, (function(_this) {
        return function(error) {
          if (error) {
            return console.error("_subscriptionDataSet error", error);
          }
        };
      })(this));
    }
  };
};

share.subscriptionDataMethods = function(collection) {
  return {
    _subscriptionDataSet: function(subscriptionDataId, path, value) {
      var connectionId, update, _ref, _ref1, _ref2;
      if (Meteor.isClient || ((_ref = this.connection) != null ? _ref.id : void 0)) {
        check(subscriptionDataId, Match.DocumentId);
      } else {
        check(subscriptionDataId, Match.Where(checkSubscriptionDataId));
      }
      check(path, Match.Where(checkPath));
      check(value, Match.Any);
      if (Meteor.isClient) {
        connectionId = null;
      } else if ((_ref1 = this.connection) != null ? _ref1.id : void 0) {
        connectionId = (_ref2 = this.connection) != null ? _ref2.id : void 0;
        subscriptionDataId = "" + connectionId + "_" + subscriptionDataId;
      } else {
        connectionId = subscriptionDataId.replace(SUBSCRIPTION_ID_REGEX, '');
      }
      if (_.isString(path)) {
        update = {};
        if (value === void 0) {
          update.$unset = {};
          update.$unset[path] = '';
        } else {
          update.$set = {};
          update.$set[path] = value;
        }
      } else {
        update = _.extend(path, {
          _connectionId: connectionId
        });
      }
      return collection.update({
        _id: subscriptionDataId,
        _connectionId: connectionId
      }, update);
    }
  };
};
/////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/peerlibrary:subscription-data/server.coffee.js                             //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var CONNECTION_ID_REGEX, SubscriptionData, originalPublish,
  __slice = [].slice;

SubscriptionData = new Mongo.Collection(null);

CONNECTION_ID_REGEX = /^.+?_/;

originalPublish = Meteor.publish;

Meteor.publish = function(name, publishFunction) {
  return originalPublish(name, function() {
    var args, id, publish, result;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    publish = this;
    if (!publish._subscriptionId) {
      return publishFunction.apply(publish, args);
    }
    assert(_.isString(publish._subscriptionId), publish._subscriptionId);
    id = "" + publish.connection.id + "_" + publish._subscriptionId;
    SubscriptionData.insert({
      _id: id,
      _connectionId: this.connection.id
    });
    _.extend(publish, share.handleMethods(Meteor, SubscriptionData, id));
    result = publishFunction.apply(publish, args);
    publish.onStop(function() {
      return SubscriptionData.remove({
        _id: id
      });
    });
    return result;
  });
};

Meteor.publish(null, function() {
  var handle;
  handle = SubscriptionData.find({
    _connectionId: this.connection.id
  }, {
    fields: {
      _connectionId: 0
    }
  }).observeChanges({
    added: (function(_this) {
      return function(id, fields) {
        id = id.replace(CONNECTION_ID_REGEX, '');
        return _this.added('_subscriptionData', id, fields);
      };
    })(this),
    changed: (function(_this) {
      return function(id, fields) {
        id = id.replace(CONNECTION_ID_REGEX, '');
        return _this.changed('_subscriptionData', id, fields);
      };
    })(this),
    removed: (function(_this) {
      return function(id) {
        id = id.replace(CONNECTION_ID_REGEX, '');
        return _this.removed('_subscriptionData', id);
      };
    })(this)
  });
  this.onStop((function(_this) {
    return function() {
      return handle.stop();
    };
  })(this));
  return this.ready();
});

Meteor.methods(share.subscriptionDataMethods(SubscriptionData));
/////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['peerlibrary:subscription-data'] = {};

})();
