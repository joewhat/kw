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
        }
    }
}
