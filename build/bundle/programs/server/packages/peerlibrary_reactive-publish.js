(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var Tracker = Package['peerlibrary:server-autorun'].Tracker;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var publishHandlerResult, __coffeescriptShare;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/peerlibrary_reactive-publish/packages/peerlibrary_reactive-publish.js                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/peerlibrary:reactive-publish/publish.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// Copy of code from Subscription.prototype._runHandler from ddp-server/livedata_server.js.                            // 1
// See https://github.com/meteor/meteor/pull/5212                                                                      // 2
                                                                                                                       // 3
publishHandlerResult = function (self, res) {                                                                          // 4
  // SPECIAL CASE: Instead of writing their own callbacks that invoke                                                  // 5
  // this.added/changed/ready/etc, the user can just return a collection                                               // 6
  // cursor or array of cursors from the publish function; we call their                                               // 7
  // _publishCursor method which starts observing the cursor and publishes the                                         // 8
  // results. Note that _publishCursor does NOT call ready().                                                          // 9
  //                                                                                                                   // 10
  // XXX This uses an undocumented interface which only the Mongo cursor                                               // 11
  // interface publishes. Should we make this interface public and encourage                                           // 12
  // users to implement it themselves? Arguably, it's unnecessary; users can                                           // 13
  // already write their own functions like                                                                            // 14
  //   var publishMyReactiveThingy = function (name, handler) {                                                        // 15
  //     Meteor.publish(name, function () {                                                                            // 16
  //       var reactiveThingy = handler();                                                                             // 17
  //       reactiveThingy.publishMe();                                                                                 // 18
  //     });                                                                                                           // 19
  //   };                                                                                                              // 20
  var isCursor = function (c) {                                                                                        // 21
    return c && c._publishCursor;                                                                                      // 22
  };                                                                                                                   // 23
  if (isCursor(res)) {                                                                                                 // 24
    try {                                                                                                              // 25
      res._publishCursor(self);                                                                                        // 26
    } catch (e) {                                                                                                      // 27
      self.error(e);                                                                                                   // 28
      return;                                                                                                          // 29
    }                                                                                                                  // 30
    // _publishCursor only returns after the initial added callbacks have run.                                         // 31
    // mark subscription as ready.                                                                                     // 32
    self.ready();                                                                                                      // 33
  } else if (_.isArray(res)) {                                                                                         // 34
    // check all the elements are cursors                                                                              // 35
    if (! _.all(res, isCursor)) {                                                                                      // 36
      self.error(new Error("Publish function returned an array of non-Cursors"));                                      // 37
      return;                                                                                                          // 38
    }                                                                                                                  // 39
    // find duplicate collection names                                                                                 // 40
    // XXX we should support overlapping cursors, but that would require the                                           // 41
    // merge box to allow overlap within a subscription                                                                // 42
    var collectionNames = {};                                                                                          // 43
    for (var i = 0; i < res.length; ++i) {                                                                             // 44
      var collectionName = res[i]._getCollectionName();                                                                // 45
      if (_.has(collectionNames, collectionName)) {                                                                    // 46
        self.error(new Error(                                                                                          // 47
          "Publish function returned multiple cursors for collection " +                                               // 48
            collectionName));                                                                                          // 49
        return;                                                                                                        // 50
      }                                                                                                                // 51
      collectionNames[collectionName] = true;                                                                          // 52
    };                                                                                                                 // 53
                                                                                                                       // 54
    try {                                                                                                              // 55
      _.each(res, function (cur) {                                                                                     // 56
        cur._publishCursor(self);                                                                                      // 57
      });                                                                                                              // 58
    } catch (e) {                                                                                                      // 59
      self.error(e);                                                                                                   // 60
      return;                                                                                                          // 61
    }                                                                                                                  // 62
    self.ready();                                                                                                      // 63
  } else if (res) {                                                                                                    // 64
    // truthy values other than cursors or arrays are probably a                                                       // 65
    // user mistake (possible returning a Mongo document via, say,                                                     // 66
    // `coll.findOne()`).                                                                                              // 67
    self.error(new Error("Publish function can only return a Cursor or "                                               // 68
                         + "an array of Cursors"));                                                                    // 69
  }                                                                                                                    // 70
};                                                                                                                     // 71
                                                                                                                       // 72
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/peerlibrary:reactive-publish/server.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Fiber, checkNames, originalLocalCollectionCursorObserveChanges, originalObserveChanges, originalPublish, wrapCallbacks,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

Fiber = Npm.require('fibers');

checkNames = function(publish, collectionNames, computation, result) {
  var collectionName, computationId, cursor, names, resultNames, _i, _len;
  if (result && _.isArray(result)) {
    resultNames = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        cursor = result[_i];
        if ('_getCollectionName' in cursor) {
          _results.push(cursor._getCollectionName());
        }
      }
      return _results;
    })();
  } else if (result && '_getCollectionName' in result) {
    resultNames = [result._getCollectionName()];
  } else {
    resultNames = [];
  }
  if (computation) {
    collectionNames[computation._id] = resultNames;
  }
  for (computationId in collectionNames) {
    names = collectionNames[computationId];
    if (!computation || computationId !== ("" + computation._id)) {
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        collectionName = names[_i];
        if (!(__indexOf.call(resultNames, collectionName) >= 0)) {
          continue;
        }
        publish.error(new Error("Multiple cursors for collection '" + collectionName + "'"));
        return false;
      }
    }
  }
  return true;
};

wrapCallbacks = function(callbacks, initializingReference) {
  var callback, callbackName, currentComputation;
  if (Tracker.active) {
    Meteor._nodeCodeMustBeInFiber();
    currentComputation = Tracker.currentComputation;
    callbacks = _.clone(callbacks);
    for (callbackName in callbacks) {
      callback = callbacks[callbackName];
      if (callbackName === 'added' || callbackName === 'changed' || callbackName === 'removed' || callbackName === 'addedBefore' || callbackName === 'movedBefore') {
        (function(callbackName, callback) {
          return callbacks[callbackName] = function() {
            var args, previousPublishComputation;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (initializingReference.initializing) {
              previousPublishComputation = Fiber.current._publishComputation;
              Fiber.current._publishComputation = currentComputation;
              try {
                return callback.apply(null, args);
              } finally {
                Fiber.current._publishComputation = previousPublishComputation;
              }
            } else {
              return callback.apply(null, args);
            }
          };
        })(callbackName, callback);
      }
    }
  }
  return callbacks;
};

originalObserveChanges = MongoInternals.Connection.prototype._observeChanges;

MongoInternals.Connection.prototype._observeChanges = function(cursorDescription, ordered, callbacks) {
  var handle, initializing;
  initializing = true;
  callbacks = wrapCallbacks(callbacks, {
    initializing: initializing
  });
  handle = originalObserveChanges.call(this, cursorDescription, ordered, callbacks);
  initializing = false;
  return handle;
};

originalLocalCollectionCursorObserveChanges = LocalCollection.Cursor.prototype.observeChanges;

LocalCollection.Cursor.prototype.observeChanges = function(options) {
  var handle, initializing;
  initializing = true;
  options = wrapCallbacks(options, {
    initializing: initializing
  });
  handle = originalLocalCollectionCursorObserveChanges.call(this, options);
  initializing = false;
  return handle;
};

originalPublish = Meteor.publish;

Meteor.publish = function(name, publishFunction) {
  return originalPublish(name, function() {
    var args, collectionNames, documents, handles, oldDocuments, originalAdded, originalReady, publish, ready, result;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    publish = this;
    oldDocuments = {};
    documents = {};
    collectionNames = {};
    publish._currentComputation = function() {
      if (Tracker.active) {
        return Tracker.currentComputation;
      } else {
        return Fiber.current._publishComputation;
      }
      return null;
    };
    publish._installCallbacks = function() {
      var computation;
      computation = this._currentComputation();
      if (!computation) {
        return;
      }
      if (!computation._publishOnStopSet) {
        computation._publishOnStopSet = true;
        computation.onStop((function(_this) {
          return function() {
            delete oldDocuments[computation._id];
            return delete documents[computation._id];
          };
        })(this));
      }
      if (!computation._publishAfterRunSet) {
        computation._publishAfterRunSet = true;
        computation.afterRun((function(_this) {
          return function() {
            var collectionName, computationId, currentComputationAddedDocumentIds, currentlyPublishedDocumentIds, docs, id, otherComputationsAddedDocumentsIds, otherComputationsPreviouslyAddedDocumentsIds, _i, _len, _ref, _ref1;
            for (collectionName in _this._documents) {
              currentlyPublishedDocumentIds = _.keys(_this._documents[collectionName] || {});
              currentComputationAddedDocumentIds = _.keys(((_ref = documents[computation._id]) != null ? _ref[collectionName] : void 0) || {});
              otherComputationsAddedDocumentsIds = _.union.apply(_, (function() {
                var _results;
                _results = [];
                for (computationId in documents) {
                  docs = documents[computationId];
                  if (computationId !== ("" + computation._id)) {
                    _results.push(_.keys(docs[collectionName] || {}));
                  }
                }
                return _results;
              })());
              otherComputationsPreviouslyAddedDocumentsIds = _.union.apply(_, (function() {
                var _results;
                _results = [];
                for (computationId in oldDocuments) {
                  docs = oldDocuments[computationId];
                  if (computationId !== ("" + computation._id)) {
                    _results.push(_.keys(docs[collectionName] || {}));
                  }
                }
                return _results;
              })());
              _ref1 = _.difference(currentlyPublishedDocumentIds, currentComputationAddedDocumentIds, otherComputationsAddedDocumentsIds, otherComputationsPreviouslyAddedDocumentsIds);
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                id = _ref1[_i];
                _this.removed(collectionName, _this._idFilter.idParse(id));
              }
            }
            computation.beforeRun(function() {
              oldDocuments[computation._id] = documents[computation._id] || {};
              return documents[computation._id] = {};
            });
            return computation._publishAfterRunSet = false;
          };
        })(this));
        computation._trackerInstance.requireFlush();
      }
    };
    originalAdded = publish.added;
    publish.added = function(collectionName, id, fields) {
      var currentComputation, field, oldFields, stringId, _ref, _ref1, _ref2, _ref3;
      stringId = this._idFilter.idStringify(id);
      this._installCallbacks();
      currentComputation = this._currentComputation();
      if (currentComputation) {
        Meteor._ensure(documents, currentComputation._id, collectionName)[stringId] = true;
      }
      if ((_ref = this._documents[collectionName]) != null ? _ref[stringId] : void 0) {
        oldFields = {};
        for (field in ((_ref1 = this._session.getCollectionView(collectionName)) != null ? (_ref2 = _ref1.documents) != null ? (_ref3 = _ref2[stringId]) != null ? _ref3.dataByKey : void 0 : void 0 : void 0) || {}) {
          oldFields[field] = void 0;
        }
        return this.changed(collectionName, id, _.extend(oldFields, fields));
      } else {
        return originalAdded.call(this, collectionName, id, fields);
      }
    };
    ready = false;
    originalReady = publish.ready;
    publish.ready = function() {
      this._installCallbacks();
      if (!ready) {
        originalReady.call(this);
      }
      ready = true;
    };
    handles = [];
    publish.autorun = function(runFunc) {
      var handle;
      handle = Tracker.autorun(function(computation) {
        var result;
        result = runFunc.call(publish, computation);
        if (!checkNames(publish, collectionNames, computation, result)) {
          computation.stop();
          return;
        }
        if (result instanceof Tracker.Computation) {
          if (publish._isDeactivated()) {
            return result.stop();
          } else {
            return handles.push(result);
          }
        } else {
          if (!publish._isDeactivated()) {
            return publishHandlerResult(publish, result);
          }
        }
      });
      handles.push(handle);
      return handle;
    };
    publish.onStop(function() {
      var handle, _results;
      _results = [];
      while (handles.length) {
        handle = handles.shift();
        _results.push(handle != null ? handle.stop() : void 0);
      }
      return _results;
    });
    result = publishFunction.apply(publish, args);
    if (!checkNames(publish, collectionNames, null, result)) {
      return;
    }
    if (result instanceof Tracker.Computation) {
      handles.push(result);
    } else {
      return result;
    }
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['peerlibrary:reactive-publish'] = {};

})();
