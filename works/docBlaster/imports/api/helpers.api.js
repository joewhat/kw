import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

if (Meteor.isClient) {
  const stringMatch = function(strOrigin, strNew){
    if(strOrigin === strNew){
      return true;
    }else{
      return false;
    }
  }
  module.exports = stringMatch;
}
