(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var assert = Package['peerlibrary:assert'].assert;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare, FiberUtils;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/peerlibrary_fiber-utils/packages/peerlibrary_fiber-utils.js                                  //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/peerlibrary:fiber-utils/base.coffee.js                                                    //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
               

FiberUtils = (function() {
  function FiberUtils() {}

  return FiberUtils;

})();
////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/peerlibrary:fiber-utils/fence.coffee.js                                                   //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Fiber, Future,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Fiber = Npm.require('fibers');

Future = Npm.require('fibers/future');

FiberUtils.OrderedFence = (function() {
  function OrderedFence(_arg) {
    this.allowRecursive = _arg.allowRecursive, this.allowNested = _arg.allowNested, this.breakDeadlocks = _arg.breakDeadlocks;
    if (this.allowRecursive == null) {
      this.allowRecursive = true;
    }
    if (this.allowNested == null) {
      this.allowNested = true;
    }
    if (this.breakDeadlocks == null) {
      this.breakDeadlocks = true;
    }
    this._futures = [];
    this._currentFiber = null;
  }

  OrderedFence.prototype.enter = function() {
    var dependedFiber, future, node, ownFuture, queue, visited, _base, _base1;
    if (Fiber.current === this._currentFiber) {
      if (!this.allowRecursive) {
        throw new Error("Recursive reentry of guarded section within the same fiber not allowed.");
      }
      return false;
    }
    if (Fiber.current._guardsActive > 0 && !this.allowNested) {
      throw new Error("Nesting of guarded sections is not allowed.");
    }
    dependedFiber = null;
    if (this._currentFiber) {
      if ((_base = Fiber.current)._dependencies == null) {
        _base._dependencies = [];
      }
      Fiber.current._dependencies.push(this._currentFiber);
      dependedFiber = this._currentFiber;
      visited = [];
      queue = [Fiber.current];
      while (true) {
        node = queue.shift();
        if (!node) {
          break;
        }
        if (__indexOf.call(visited, node) >= 0) {
          if (this.breakDeadlocks) {
            Fiber.current._dependencies = _.without(Fiber.current._dependencies, this._currentFiber);
            throw new Error("Dependency cycle detected between guarded sections.");
          }
          console.warn("Dependency cycle detected between guarded sections. Deadlock not broken.");
          break;
        }
        visited.push(node);
        queue = queue.concat(node._dependencies);
      }
      queue = null;
      visited = null;
    }
    future = null;
    if (!_.isEmpty(this._futures)) {
      future = this._futures[this._futures.length - 1];
    }
    ownFuture = new Future();
    this._futures.push(ownFuture);
    if (future != null) {
      future.wait();
    }
    if (dependedFiber) {
      Fiber.current._dependencies = _.without(Fiber.current._dependencies, dependedFiber);
    }
    assert(this._futures[0] === ownFuture);
    assert(!this._currentFiber);
    this._currentFiber = Fiber.current;
    if ((_base1 = this._currentFiber)._guardsActive == null) {
      _base1._guardsActive = 0;
    }
    this._currentFiber._guardsActive++;
    return true;
  };

  OrderedFence.prototype.exit = function(topLevel) {
    var _ref;
    if (!topLevel) {
      return;
    }
    assert(this._currentFiber._guardsActive > 0);
    this._currentFiber._guardsActive--;
    this._currentFiber = null;
    return (_ref = this._futures.shift()) != null ? _ref["return"]() : void 0;
  };

  return OrderedFence;

})();
////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/peerlibrary:fiber-utils/synchronize.coffee.js                                             //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
FiberUtils.synchronize = function(guardObject, uniqueId, body, options) {
  var guards, topLevel;
  if (options == null) {
    options = {};
  }
  guards = guardObject._guards != null ? guardObject._guards : guardObject._guards = {};
  if (guards[uniqueId] == null) {
    guards[uniqueId] = new FiberUtils.OrderedFence(options);
  }
  topLevel = guards[uniqueId].enter();
  try {
    return body();
  } finally {
    guards[uniqueId].exit(topLevel);
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/peerlibrary:fiber-utils/ensure.coffee.js                                                  //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Fiber;

Fiber = Npm.require('fibers');

FiberUtils.ensureFiber = function(func) {
  if (Fiber.current) {
    func();
  } else {
    new Fiber(func).run();
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

///////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['peerlibrary:fiber-utils'] = {}, {
  FiberUtils: FiberUtils
});

})();
