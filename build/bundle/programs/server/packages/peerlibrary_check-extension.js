(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// packages/peerlibrary_check-extension/packages/peerlibrary_check-extension.js             //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
(function () {

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/peerlibrary:check-extension/lib/match.coffee.js                              //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var EMAIL_REGEX, INVALID_ID_CHARS_REGEX, INVALID_SHA256_CHARS_REGEX, UNMISTAKABLE_CHARS,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';

INVALID_ID_CHARS_REGEX = new RegExp("[^" + UNMISTAKABLE_CHARS + "]");

INVALID_SHA256_CHARS_REGEX = new RegExp('[^a-f0-9]');

EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

Match.PositiveNumber = Match.Where(function(x) {
  check(x, Number);
  return x > 0;
});

Match.NonEmptyString = Match.Where(function(x) {
  check(x, String);
  return x.trim().length > 0;
});

Match.DocumentId = Match.Where(function(x) {
  check(x, String);
  check(x, Match.Where(function(y) {
    return y.length === 17;
  }));
  return !INVALID_ID_CHARS_REGEX.test(x);
});

Match.ObjectWithOnlyStrings = Match.Where(function(x) {
  var key, value, _results;
  check(x, Object);
  _results = [];
  for (key in x) {
    value = x[key];
    check(key, String);
    _results.push(check(value, String));
  }
  return _results;
});

Match.Enumeration = function(pattern, enumeration) {
  var values;
  values = _.values(enumeration);
  return Match.Where(function(a) {
    check(a, pattern);
    return __indexOf.call(values, a) >= 0;
  });
};

Match.SHA256String = Match.Where(function(x) {
  check(x, String);
  check(x, Match.Where(function(y) {
    return y.length === 64;
  }));
  return !INVALID_SHA256_CHARS_REGEX.test(x);
});

Match.EMail = Match.Where(function(x) {
  check(x, Match.NonEmptyString);
  return EMAIL_REGEX.test(x);
});

Match.OptionalOrNull = function(pattern) {
  return Match.Optional(Match.OneOf(pattern, null, void 0));
};
///////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

//////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['peerlibrary:check-extension'] = {};

})();
