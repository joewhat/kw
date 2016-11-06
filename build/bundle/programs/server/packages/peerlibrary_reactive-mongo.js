(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Tracker = Package['peerlibrary:server-autorun'].Tracker;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/peerlibrary_reactive-mongo/packages/peerlibrary_reactive-mongo.js                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/peerlibrary:reactive-mongo/server.coffee.js                                                        //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var MeteorCursor, method, originalCount, originalExists, originalObserveChanges, _fn, _i, _len, _ref,
  __slice = [].slice;

MeteorCursor = Object.getPrototypeOf(MongoInternals.defaultRemoteCollectionDriver().mongo.find()).constructor;

originalObserveChanges = MeteorCursor.prototype.observeChanges;

originalCount = MeteorCursor.prototype.count;

originalExists = MeteorCursor.prototype.exists;

MeteorCursor.prototype._isReactive = function() {
  var _ref;
  return (_ref = this._cursorDescription.options.reactive) != null ? _ref : true;
};

MeteorCursor.prototype._depend = function(changers) {
  var dependency, fnName, initializing, options, _i, _len, _ref;
  if (!Tracker.active) {
    return;
  }
  dependency = new Tracker.Dependency();
  dependency.depend();
  initializing = true;
  options = {};
  _ref = ['added', 'changed', 'removed', 'addedBefore', 'movedBefore'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    fnName = _ref[_i];
    if (changers[fnName]) {
      options[fnName] = function() {
        if (!initializing) {
          return dependency.changed();
        }
      };
    }
  }
  this.observeChanges(options);
  return initializing = false;
};

MeteorCursor.prototype.observeChanges = function(options) {
  var handle;
  handle = originalObserveChanges.call(this, options);
  if (Tracker.active && this._isReactive()) {
    Tracker.onInvalidate((function(_this) {
      return function() {
        return handle.stop();
      };
    })(this));
  }
  return handle;
};

_ref = ['forEach', 'map', 'fetch'];
_fn = function(method) {
  var originalMethod;
  originalMethod = MeteorCursor.prototype[method];
  return MeteorCursor.prototype[method] = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this._isReactive()) {
      this._depend({
        addedBefore: true,
        removed: true,
        changed: true,
        movedBefore: true
      });
    }
    return originalMethod.apply(this, args);
  };
};
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  method = _ref[_i];
  _fn(method);
}

MeteorCursor.prototype.count = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (this._isReactive()) {
    this._depend({
      added: true,
      removed: true
    });
  }
  return originalCount.apply(this, args);
};

if (originalExists) {
  MeteorCursor.prototype.exists = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this._isReactive()) {
      this._depend({
        added: true,
        removed: true
      });
    }
    return originalExists.apply(this, args);
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['peerlibrary:reactive-mongo'] = {};

})();
