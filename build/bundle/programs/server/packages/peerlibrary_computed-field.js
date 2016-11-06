(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var _ = Package.underscore._;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare, ComputedField;

(function(){

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/peerlibrary_computed-field/lib.coffee.js                              //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
                                                                                  // 1
                                                                                  //
ComputedField = (function() {                                                     // 1
  function ComputedField(func, equalsFunc, dontStop) {                            //
    var autorun, currentView, getter, handle, lastValue, ref, ref1, startAutorun;
    if (_.isBoolean(equalsFunc)) {                                                //
      dontStop = equalsFunc;                                                      //
      equalsFunc = null;                                                          //
    }                                                                             //
    handle = null;                                                                //
    lastValue = null;                                                             //
    if (currentView = (ref = Package.blaze) != null ? (ref1 = ref.Blaze) != null ? ref1.currentView : void 0 : void 0) {
      autorun = function(f) {                                                     //
        return currentView.autorun(f);                                            //
      };                                                                          //
    } else {                                                                      //
      autorun = Tracker.autorun;                                                  //
    }                                                                             //
    startAutorun = function() {                                                   //
      var originalStop;                                                           // 18
      handle = autorun(function(computation) {                                    //
        var value;                                                                // 19
        value = func();                                                           //
        if (!lastValue) {                                                         //
          lastValue = new ReactiveVar(value, equalsFunc);                         //
        } else {                                                                  //
          lastValue.set(value);                                                   //
        }                                                                         //
        if (!dontStop) {                                                          //
          return Tracker.afterFlush(function() {                                  //
            if (!lastValue.dep.hasDependents()) {                                 //
              return getter.stop();                                               //
            }                                                                     //
          });                                                                     //
        }                                                                         //
      });                                                                         //
      if (handle.onStop) {                                                        //
        return handle.onStop(function() {                                         //
          return handle = null;                                                   //
        });                                                                       //
      } else {                                                                    //
        originalStop = handle.stop;                                               //
        return handle.stop = function() {                                         //
          if (handle) {                                                           //
            originalStop.call(handle);                                            //
          }                                                                       //
          return handle = null;                                                   //
        };                                                                        //
      }                                                                           //
    };                                                                            //
    startAutorun();                                                               //
    getter = function() {                                                         //
      getter.flush();                                                             //
      return lastValue.get();                                                     //
    };                                                                            //
    if (Object.setPrototypeOf) {                                                  //
      Object.setPrototypeOf(getter, this.constructor.prototype);                  //
    } else {                                                                      //
      getter.__proto__ = this.constructor.prototype;                              //
    }                                                                             //
    getter.toString = function() {                                                //
      return "ComputedField{" + (this()) + "}";                                   //
    };                                                                            //
    getter.apply = function() {                                                   //
      return getter();                                                            //
    };                                                                            //
    getter.call = function() {                                                    //
      return getter();                                                            //
    };                                                                            //
    getter.stop = function() {                                                    //
      if (handle != null) {                                                       //
        handle.stop();                                                            //
      }                                                                           //
      return handle = null;                                                       //
    };                                                                            //
    getter._isRunning = function() {                                              //
      return !!handle;                                                            //
    };                                                                            //
    getter.flush = function() {                                                   //
      return Tracker.nonreactive(function() {                                     //
        if (handle) {                                                             //
          return handle._recompute();                                             //
        } else {                                                                  //
          return startAutorun();                                                  //
        }                                                                         //
      });                                                                         //
    };                                                                            //
    return getter;                                                                // 90
  }                                                                               //
                                                                                  //
  return ComputedField;                                                           //
                                                                                  //
})();                                                                             //
                                                                                  //
////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['peerlibrary:computed-field'] = {}, {
  ComputedField: ComputedField
});

})();

//# sourceMappingURL=peerlibrary_computed-field.js.map
