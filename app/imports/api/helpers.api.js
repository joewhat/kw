import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

if (Meteor.isClient) {
    module.exports = {
        stringMatch : (strOrigin, strNew) => {
            if(strOrigin === strNew){
                return true;
              }else{
                return false;
              }
        },
        regexMultiWordsSearch : (searchString) => {
            // turns "hej med dig" into "hej|med|dig"
            return searchString.match(/\S+/g).toString().replace(/\,/g, '|');
        },
        convertDate : (date) => {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            let secs = date.getSeconds().toString();
            secs = secs.length > 1 ? secs : '0' + secs;
            const year = date.getFullYear();
            let month = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            let day = date.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            return year  + '.' + month + '.' + day + ' - ' + hours + ':' + minutes + ':' + secs;
        }
    }
} else if (Meteor.isServer) {
  module.exports = {
      stringMatch : (strOrigin, strNew) => {
          if(strOrigin === strNew){
              return true;
            }else{
              return false;
            }
      },
      regexMultiWordsSearch : (searchString) => {
          // turns "hej med dig" into "hej|med|dig"
          return searchString.match(/\S+/g).toString().replace(/\,/g, '|');
      },
      convertDate : (date) => {
          const year = date.getFullYear();
          let month = (1 + date.getMonth()).toString();
          month = month.length > 1 ? month : '0' + month;
          let day = date.getDate().toString();
          day = day.length > 1 ? day : '0' + day;
          return year  + '.' + month + '.' + day;
      }
  }
}
