(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var assert = Package['peerlibrary:assert'].assert;
var FiberUtils = Package['peerlibrary:fiber-utils'].FiberUtils;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                        //
// packages/peerlibrary_server-autorun/packages/peerlibrary_server-autorun.js                             //
//                                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                          //
(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/peerlibrary:server-autorun/server.coffee.js                                                //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Fiber, Future, TrackerInstance, guard, nextId, privateObject;

Fiber = Npm.require('fibers');

Future = Npm.require('fibers/future');

privateObject = {};

guard = {};

nextId = 1;

TrackerInstance = (function() {
  function TrackerInstance() {
    this.active = false;
    this.currentComputation = null;
    this.pendingComputations = [];
    this.willFlush = false;
    this.inFlush = null;
    this.inRequireFlush = false;
    this.inCompute = false;
    this.throwFirstError = false;
    this.afterFlushCallbacks = [];
  }

  TrackerInstance.prototype.setCurrentComputation = function(computation) {
    this.currentComputation = computation;
    return this.active = !!computation;
  };

  TrackerInstance.prototype._debugFunc = function() {
    if (typeof Meteor !== "undefined" && Meteor !== null ? Meteor._debug : void 0) {
      return Meteor._debug;
    }
    if (typeof console !== "undefined" && console !== null ? console.error : void 0) {
      return function() {
        return console.error.apply(console, arguments);
      };
    }
    return function() {};
  };

  TrackerInstance.prototype._maybeSuppressMoreLogs = function(messagesLength) {
    if (typeof Meteor !== "undefined") {
      if (Meteor._suppressed_log_expected()) {
        return Meteor._suppress_log(messagesLength - 1);
      }
    }
  };

  TrackerInstance.prototype._throwOrLog = function(from, error) {
    var idx, message, printArg, printArgs, _i, _len, _results;
    if (this.throwFirstError) {
      throw error;
    } else {
      printArgs = ["Exception from Tracker " + from + " function:"];
      if (error.stack && error.message && error.name) {
        idx = error.stack.indexOf(error.message);
        if (idx < 0 || idx > error.name.length + 2) {
          message = error.name + ": " + error.message;
          printArgs.push(message);
        }
      }
      printArgs.push(error.stack);
      this._maybeSuppressMoreLogs(printArgs.length);
      _results = [];
      for (_i = 0, _len = printArgs.length; _i < _len; _i++) {
        printArg = printArgs[_i];
        _results.push(this._debugFunc()(printArg));
      }
      return _results;
    }
  };

  TrackerInstance.prototype._deferAndTransfer = function(func) {
    return Meteor.defer((function(_this) {
      return function() {
        assert(!Fiber.current._trackerInstance);
        try {
          Fiber.current._trackerInstance = _this;
          return func();
        } finally {
          Fiber.current._trackerInstance = null;
        }
      };
    })(this));
  };

  TrackerInstance.prototype.requireFlush = function() {
    if (this.willFlush) {
      return;
    }
    this._deferAndTransfer((function(_this) {
      return function() {
        return _this._runFlush({
          fromRequireFlush: true
        });
      };
    })(this));
    return this.willFlush = true;
  };

  TrackerInstance.prototype._runFlush = function(options) {
    var computation, error, finishedTry, func, inFlush, recomputedCount;
    if (this.inFlush instanceof Future) {
      if (options != null ? options.fromRequireFlush : void 0) {
        return;
      }
      this.inFlush.wait();
      assert(!this.inFlush);
    }
    if (this.inFlush && (options != null ? options.fromRequireFlush : void 0)) {
      return;
    }
    if (this.inFlush) {
      throw new Error("Can't call Tracker.flush while flushing");
    }
    if (this.inCompute) {
      if (options != null ? options.fromRequireFlush : void 0) {
        this._deferAndTransfer((function(_this) {
          return function() {
            return _this._runFlush(options);
          };
        })(this));
        return;
      }
      throw new Error("Can't flush inside Tracker.autorun");
    }
    if (options != null ? options.fromRequireFlush : void 0) {
      this.inFlush = new Future();
    } else {
      this.inFlush = true;
    }
    this.willFlush = true;
    this.throwFirstError = !!(options != null ? options.throwFirstError : void 0);
    recomputedCount = 0;
    finishedTry = false;
    try {
      while (this.pendingComputations.length || this.afterFlushCallbacks.length) {
        while (this.pendingComputations.length) {
          computation = this.pendingComputations.shift();
          computation._recompute();
          if (computation._needsRecompute()) {
            this.pendingComputations.unshift(computation);
          }
          if (!(options != null ? options.finishSynchronously : void 0) && ++recomputedCount > 1000) {
            finishedTry = true;
            return;
          }
        }
        if (this.afterFlushCallbacks.length) {
          func = this.afterFlushCallbacks.shift();
          try {
            func();
          } catch (_error) {
            error = _error;
            this._throwOrLog("afterFlush", error);
          }
        }
      }
      return finishedTry = true;
    } finally {
      inFlush = this.inFlush;
      if (!finishedTry) {
        this.inFlush = null;
        if (inFlush instanceof Future) {
          inFlush["return"]();
        }
        this._runFlush({
          finishSynchronously: options != null ? options.finishSynchronously : void 0,
          throwFirstError: false
        });
      }
      this.willFlush = false;
      this.inFlush = null;
      if (inFlush instanceof Future) {
        inFlush["return"]();
      }
      if (this.pendingComputations.length || this.afterFlushCallbacks.length) {
        if (options != null ? options.finishSynchronously : void 0) {
          throw new Error("still have more to do?");
        }
        Meteor.setTimeout((function(_this) {
          return function() {
            return _this.requireFlush();
          };
        })(this), 10);
      }
    }
  };

  return TrackerInstance;

})();

Tracker._computations = {};

Tracker._trackerInstance = function() {
  var _base;
  Meteor._nodeCodeMustBeInFiber();
  return (_base = Fiber.current)._trackerInstance != null ? _base._trackerInstance : _base._trackerInstance = new TrackerInstance();
};

Tracker.flush = function(options) {
  return Tracker._trackerInstance()._runFlush({
    finishSynchronously: true,
    throwFirstError: options != null ? options._throwFirstError : void 0
  });
};

Tracker.autorun = function(func, options) {
  var c;
  if (typeof func !== "function") {
    throw new Error("Tracker.autorun requires a function argument");
  }
  c = new Tracker.Computation(func, Tracker.currentComputation, options != null ? options.onError : void 0, privateObject);
  if (Tracker.active) {
    Tracker.onInvalidate(function() {
      return c.stop();
    });
  }
  return c;
};

Tracker.nonreactive = function(f) {
  var previous, trackerInstance;
  trackerInstance = Tracker._trackerInstance();
  previous = trackerInstance.currentComputation;
  trackerInstance.setCurrentComputation(null);
  try {
    return f();
  } finally {
    trackerInstance.setCurrentComputation(previous);
  }
};

Tracker.onInvalidate = function(f) {
  if (!Tracker.active) {
    throw new Error("Tracker.onInvalidate requires a currentComputation");
  }
  return Tracker.currentComputation.onInvalidate(f);
};

Tracker.afterFlush = function(f) {
  var trackerInstance;
  trackerInstance = Tracker._trackerInstance();
  trackerInstance.afterFlushCallbacks.push(f);
  return trackerInstance.requireFlush();
};

Object.defineProperties(Tracker, {
  currentComputation: {
    get: function() {
      return Tracker._trackerInstance().currentComputation;
    }
  },
  active: {
    get: function() {
      return Tracker._trackerInstance().active;
    }
  }
});

Tracker.Computation = (function() {
  function Computation(func, _parent, _onError, _private) {
    var errored, onException;
    this._parent = _parent;
    this._onError = _onError;
    if (_private !== privateObject) {
      throw new Error("Tracker.Computation constructor is private; use Tracker.autorun");
    }
    this.stopped = false;
    this.invalidated = false;
    this.firstRun = true;
    this._id = nextId++;
    this._onInvalidateCallbacks = [];
    this._onStopCallbacks = [];
    this._beforeRunCallbacks = [];
    this._afterRunCallbacks = [];
    this._recomputing = false;
    this._trackerInstance = Tracker._trackerInstance();
    onException = (function(_this) {
      return function(error) {
        if (_this.firstRun) {
          throw error;
        }
        if (_this._onError) {
          return _this._onError(error);
        } else {
          return _this._trackerInstance._throwOrLog("recompute", error);
        }
      };
    })(this);
    this._func = Meteor.bindEnvironment(func, onException, this);
    Tracker._computations[this._id] = this;
    errored = true;
    try {
      this._compute();
      errored = false;
    } finally {
      this.firstRun = false;
      if (errored) {
        this.stop();
      }
    }
  }

  Computation.prototype.onInvalidate = function(f) {
    return FiberUtils.ensureFiber((function(_this) {
      return function() {
        if (typeof f !== "function") {
          throw new Error("onInvalidate requires a function");
        }
        if (_this.invalidated) {
          return Tracker.nonreactive(function() {
            return f(_this);
          });
        } else {
          return _this._onInvalidateCallbacks.push(f);
        }
      };
    })(this));
  };

  Computation.prototype.onStop = function(f) {
    return FiberUtils.ensureFiber((function(_this) {
      return function() {
        if (typeof f !== "function") {
          throw new Error("onStop requires a function");
        }
        if (_this.stopped) {
          return Tracker.nonreactive(function() {
            return f(_this);
          });
        } else {
          return _this._onStopCallbacks.push(f);
        }
      };
    })(this));
  };

  Computation.prototype.beforeRun = function(f) {
    if (typeof f !== "function") {
      throw new Error("beforeRun requires a function");
    }
    return this._beforeRunCallbacks.push(f);
  };

  Computation.prototype.afterRun = function(f) {
    if (typeof f !== "function") {
      throw new Error("afterRun requires a function");
    }
    return this._afterRunCallbacks.push(f);
  };

  Computation.prototype.invalidate = function() {
    return FiberUtils.ensureFiber((function(_this) {
      return function() {
        var callback, _i, _len, _ref;
        if (!_this.invalidated) {
          if (!_this._recomputing && !_this.stopped) {
            _this._trackerInstance.requireFlush();
            _this._trackerInstance.pendingComputations.push(_this);
          }
          _this.invalidated = true;
          _ref = _this._onInvalidateCallbacks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            callback = _ref[_i];
            Tracker.nonreactive(function() {
              return callback(_this);
            });
          }
          return _this._onInvalidateCallbacks = [];
        }
      };
    })(this));
  };

  Computation.prototype.stop = function() {
    return FiberUtils.ensureFiber((function(_this) {
      return function() {
        return FiberUtils.synchronize(guard, _this._id, function() {
          var callback, _results;
          if (_this.stopped) {
            return;
          }
          _this.stopped = true;
          _this.invalidate();
          delete Tracker._computations[_this._id];
          _results = [];
          while (_this._onStopCallbacks.length) {
            callback = _this._onStopCallbacks.shift();
            _results.push(Tracker.nonreactive(function() {
              return callback(_this);
            }));
          }
          return _results;
        });
      };
    })(this));
  };

  Computation.prototype._runInside = function(func) {
    return FiberUtils.synchronize(guard, this._id, (function(_this) {
      return function() {
        var previousComputation, previousInCompute, previousTrackerInstance;
        Meteor._nodeCodeMustBeInFiber();
        previousTrackerInstance = Tracker._trackerInstance();
        Fiber.current._trackerInstance = _this._trackerInstance;
        previousComputation = _this._trackerInstance.currentComputation;
        _this._trackerInstance.setCurrentComputation(_this);
        previousInCompute = _this._trackerInstance.inCompute;
        _this._trackerInstance.inCompute = true;
        try {
          return func(_this);
        } finally {
          Fiber.current._trackerInstance = previousTrackerInstance;
          _this._trackerInstance.setCurrentComputation(previousComputation);
          _this._trackerInstance.inCompute = previousInCompute;
        }
      };
    })(this));
  };

  Computation.prototype._compute = function() {
    return FiberUtils.synchronize(guard, this._id, (function(_this) {
      return function() {
        _this.invalidated = false;
        return _this._runInside(function(computation) {
          var callback, _results;
          while (_this._beforeRunCallbacks.length) {
            callback = _this._beforeRunCallbacks.shift();
            Tracker.nonreactive(function() {
              return callback(_this);
            });
          }
          _this._func.call(null, _this);
          _results = [];
          while (_this._afterRunCallbacks.length) {
            callback = _this._afterRunCallbacks.shift();
            _results.push(Tracker.nonreactive(function() {
              return callback(_this);
            }));
          }
          return _results;
        });
      };
    })(this));
  };

  Computation.prototype._needsRecompute = function() {
    return this.invalidated && !this.stopped;
  };

  Computation.prototype._recompute = function() {
    return FiberUtils.synchronize(guard, this._id, (function(_this) {
      return function() {
        assert(!_this._recomputing);
        _this._recomputing = true;
        try {
          if (_this._needsRecompute()) {
            return _this._compute();
          }
        } finally {
          _this._recomputing = false;
        }
      };
    })(this));
  };

  Computation.prototype.flush = function() {
    return FiberUtils.ensureFiber((function(_this) {
      return function() {
        if (_this._recomputing) {
          return;
        }
        return _this._recompute();
      };
    })(this));
  };

  Computation.prototype.run = function() {
    return FiberUtils.ensureFiber((function(_this) {
      return function() {
        _this.invalidate();
        return _this.flush();
      };
    })(this));
  };

  return Computation;

})();

Tracker.Dependency = (function() {
  function Dependency() {
    this._dependentsById = {};
  }

  Dependency.prototype.depend = function(computation) {
    var id;
    if (!computation) {
      if (!Tracker.active) {
        return false;
      }
      computation = Tracker.currentComputation;
    }
    id = computation._id;
    if (!(id in this._dependentsById)) {
      this._dependentsById[id] = computation;
      computation.onInvalidate((function(_this) {
        return function() {
          return delete _this._dependentsById[id];
        };
      })(this));
      return true;
    }
    return false;
  };

  Dependency.prototype.changed = function() {
    var computation, id, _ref, _results;
    _ref = this._dependentsById;
    _results = [];
    for (id in _ref) {
      computation = _ref[id];
      _results.push(computation.invalidate());
    }
    return _results;
  };

  Dependency.prototype.hasDependents = function() {
    var computation, id, _ref;
    _ref = this._dependentsById;
    for (id in _ref) {
      computation = _ref[id];
      return true;
    }
    return false;
  };

  return Dependency;

})();
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['peerlibrary:server-autorun'] = {}, {
  Tracker: Tracker
});

})();

//# sourceMappingURL=peerlibrary_server-autorun.js.map
