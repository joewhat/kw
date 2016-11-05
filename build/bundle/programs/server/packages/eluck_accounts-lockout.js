(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var Accounts = Package['accounts-base'].Accounts;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var __coffeescriptShare, AccountsLockout;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/eluck_accounts-lockout/packages/eluck_accounts-lockout.js                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/eluck:accounts-lockout/accounts-lockout.coffee.js                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ensurePositiveNumber;                 

AccountsLockout = {
  settings: {
    duration: 15,
    attempts: 5
  },
  startup: function() {
    AccountsLockout.updateSettingsIfSpecified();
    AccountsLockout.scheduleUnlocksForLockedAccounts();
    AccountsLockout.unlockAccountsIfLockoutAlreadyExpired();
    return AccountsLockout.hookIntoAccounts();
  },
  updateSettingsIfSpecified: function() {
    var key, value, _ref;
    if (Meteor.settings["accounts-lockout"]) {
      _ref = Meteor.settings["accounts-lockout"];
      for (key in _ref) {
        value = _ref[key];
        AccountsLockout.settings[key] = value;
      }
    }
    check(AccountsLockout.settings.duration, Match.Integer);
    check(AccountsLockout.settings.attempts, Match.Integer);
    if (AccountsLockout.settings.duration < 0) {
      throw 'eluck:accounts-lockout package - "duration" is not positive integer';
    }
    if (AccountsLockout.settings.attempts < 0) {
      throw 'eluck:accounts-lockout package - "attempts" is not positive integer';
    }
  },
  scheduleUnlocksForLockedAccounts: function() {
    var currentTime, lockedAccountsCursor;
    currentTime = Number(new Date());
    lockedAccountsCursor = Meteor.users.find({
      'services.accounts-lockout.unlockTime': {
        $gt: currentTime
      }
    }, {
      fields: {
        'services.accounts-lockout.unlockTime': 1
      }
    });
    currentTime = Number(new Date());
    return lockedAccountsCursor.forEach(function(user) {
      var lockDuration;
      lockDuration = user.services['accounts-lockout'].unlockTime - currentTime;
      lockDuration = lockDuration < AccountsLockout.settings.duration ? lockDuration : AccountsLockout.settings.duration;
      lockDuration = lockDuration > 1 ? lockDuration : 1;
      return Meteor.setTimeout(AccountsLockout.unlockAccount.bind(null, user._id), lockDuration);
    });
  },
  unlockAccount: function(userId) {
    return Meteor.users.update(userId, {
      $unset: {
        'services.accounts-lockout.unlockTime': 0,
        'services.accounts-lockout.failedAttempts': 0
      }
    });
  },
  unlockAccountsIfLockoutAlreadyExpired: function() {
    var currentTime;
    currentTime = Number(new Date());
    return Meteor.users.update({
      'services.accounts-lockout.unlockTime': {
        $lt: currentTime
      }
    }, {
      $unset: {
        'services.accounts-lockout.unlockTime': 0,
        'services.accounts-lockout.failedAttempts': 0
      }
    });
  },
  hookIntoAccounts: function() {
    Accounts.validateLoginAttempt(AccountsLockout.validateLoginAttempt);
    Accounts.onLogin(AccountsLockout.onLogin);
    return Accounts.onLoginFailure(AccountsLockout.onLoginFailure);
  },
  validateLoginAttempt: function(loginInfo) {
    var currentTime, duration, _ref, _ref1, _ref2, _ref3;
    if (loginInfo.type !== 'password') {
      return loginInfo.allowed;
    }
    if (!loginInfo.user) {
      return loginInfo.allowed;
    }
    currentTime = Number(new Date());
    if (((_ref = loginInfo.user.services) != null ? (_ref1 = _ref['accounts-lockout']) != null ? _ref1.unlockTime : void 0 : void 0) <= currentTime) {
      AccountsLockout.unlockAccount(loginInfo.user._id);
      return loginInfo.allowed;
    }
    if (((_ref2 = loginInfo.user.services) != null ? (_ref3 = _ref2['accounts-lockout']) != null ? _ref3.unlockTime : void 0 : void 0) > currentTime) {
      duration = loginInfo.user.services['accounts-lockout'].unlockTime - currentTime;
      duration = Math.ceil(duration / 1000);
      duration = duration > 1 ? duration : 1;
      throw new Meteor.Error(AccountsLockout.errorCode, JSON.stringify({
        message: AccountsLockout.accountLockedMessage,
        duration: duration
      }));
    }
    return loginInfo.allowed;
  },
  accountLockedMessage: 'Wrong passwords were submitted too many times. Account is locked for a while.',
  errorCode: 423,
  onLogin: function(loginInfo) {
    if (loginInfo.type !== 'password') {
      return;
    }
    return Meteor.users.update(loginInfo.user._id, {
      $unset: {
        'services.accounts-lockout.unlockTime': 0,
        'services.accounts-lockout.failedAttempts': 0
      }
    });
  },
  onLoginFailure: function(loginInfo) {
    var currentTime, failedAttempts, lastFailedAttempt, unlockTime, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
    if (((_ref = loginInfo.error) != null ? _ref.reason : void 0) !== 'Incorrect password') {
      return;
    }
    if (!loginInfo.user) {
      return;
    }
    if ((_ref1 = loginInfo.user.services) != null ? (_ref2 = _ref1['accounts-lockout']) != null ? _ref2.unlockTime : void 0 : void 0) {
      return;
    }
    failedAttempts = 1 + ensurePositiveNumber((_ref3 = loginInfo.user.services) != null ? (_ref4 = _ref3['accounts-lockout']) != null ? _ref4.failedAttempts : void 0 : void 0);
    lastFailedAttempt = ensurePositiveNumber((_ref5 = loginInfo.user.services) != null ? (_ref6 = _ref5['accounts-lockout']) != null ? _ref6.lastFailedAttempt : void 0 : void 0);
    currentTime = Number(new Date());
    failedAttempts = currentTime - lastFailedAttempt > 1000 * AccountsLockout.settings.duration ? 1 : failedAttempts;
    if (failedAttempts < AccountsLockout.settings.attempts) {
      return Meteor.users.update(loginInfo.user._id, {
        $set: {
          'services.accounts-lockout.failedAttempts': failedAttempts,
          'services.accounts-lockout.lastFailedAttempt': currentTime
        }
      });
    }
    unlockTime = 1000 * AccountsLockout.settings.duration + currentTime;
    Meteor.users.update(loginInfo.user._id, {
      $set: {
        'services.accounts-lockout.unlockTime': unlockTime,
        'services.accounts-lockout.failedAttempts': failedAttempts,
        'services.accounts-lockout.lastFailedAttempt': currentTime
      }
    });
    return Meteor.setTimeout(AccountsLockout.unlockAccount.bind(null, loginInfo.user._id), 1000 * AccountsLockout.settings.duration);
  }
};

Meteor.startup(AccountsLockout.startup);

ensurePositiveNumber = function(num) {
  return Math.abs(Number(num) || 0);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['eluck:accounts-lockout'] = {}, {
  AccountsLockout: AccountsLockout
});

})();

//# sourceMappingURL=eluck_accounts-lockout.js.map
