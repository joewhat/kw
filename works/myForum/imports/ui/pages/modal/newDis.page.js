import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../../api/discus.api.js';

import '../../../api/discus.api.js';
import './newDis.page.html';

Template.newDisTemplate.events({
    'click .close-newDis-button'(event) {
      Session.set('modalLoad', '');
    },
    'submit .create-new-discussion-form'(event){
        event.preventDefault();
        const data = $('.create-new-discussion-form').serializeJSON();
        Meteor.call('discussions-insert', data, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {
            // Handle our return value.
            //console.log('created new discus');
          }
        });

        // Clear form
        event.target.header.value = '';
        event.target.description.value = '';
        // close modal
        Session.set('modalLoad', '');
    }
});
