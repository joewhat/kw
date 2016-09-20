import { Session as SessionOrigin } from 'meteor/session';
import { Tracker } from 'meteor/tracker';


// Non reactive get method
SessionOrigin.getNonReactive = function(key) {
  return Tracker.nonreactive(function () {
    return SessionOrigin.get(key);
  });
};

SessionOrigin.setNonReactive = function(key, value) {
  return Tracker.nonreactive(function () {
    return SessionOrigin.set(key, value);
  });
};


export const Session = SessionOrigin;
