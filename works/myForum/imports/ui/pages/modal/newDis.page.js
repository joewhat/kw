import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../../api/discus.api.js';

import '../../../api/discus.api.js';
import './newDis.page.html';



Template.newDisTemplate.onRendered(function () {
  this.autorun(function() {
    Meteor.defer(function() {
      Session.set('newDisValidate-header', false);
      Session.set('newDisValidate-description', false);
      $('.create-new-discussion-header-input').focus();
    });
  });
});

Template.newDisTemplate.events({
    'click .close-newDis-button'(event) {
      Session.set('modalLoad', '');
    },

    'submit .create-new-discussion-form'(event){
        event.preventDefault();
        const data = $('.create-new-discussion-form').serializeJSON();

        if (Session.get('newDisValidate-description') && Session.get('newDisValidate-header')) {
            Meteor.call('discussions-insert', data, function( error, response ) {
              if ( error ) {
                // Handle our error.
                console.log('wtf: ' + error);
              } else {
                // Handle our return value.
                //console.log('created new discus');
                // Clear form
                event.target.header.value = '';
                event.target.description.value = '';
                const discussionId = response;
                console.log('createnew res: ', response);

                Session.set('activeDiscussionId', discussionId);
                const data = { username: Meteor.user().username, discussionId: discussionId };
                Meteor.call('update-active-discussionId', data, function( error, response ) {
                  if ( error ) {
                    // Handle our error.
                    console.log('wtf: ' + error);
                  } else {

                  }
                });
                console.log('set activeDiscussionId');
                BlazeLayout.render('mainLayout', {layer1: 'discussionPageTemplate'});

                // close modal
                Session.set('modalLoad', '');
              }
            });

        } else {
          if (!Session.get('newDisValidate-description')) {
            $('.create-new-discussion-body-input').addClass('error-input');
          }
          if (!Session.get('newDisValidate-header')) {
            $('.create-new-discussion-header-input').addClass('error-input');
          }
        }
    },

    'keyup .create-new-discussion-header-input'(event) {
      const ptn = /^[a-zA-Z0-9åøæ_.-\s]+$/;
      const val = event.target.value;
      const $target = $('.create-new-discussion-header-input');
      $('.create-new-discussion-error').text('');

      if (ptn.test(val)) {

        Meteor.call('discussionExists', val, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {
            // Handle our return value.
            //console.log('created new discus');
            if (!response) {
              Session.set('newDisValidate-header', true);
              $target.removeClass('error-input');
            } else {
              Session.set('newDisValidate-header', false);
              $target.addClass('error-input');
              $('.create-new-discussion-error').text(' Discussion already exitst!');
            }
          }
          // console.log('discussionExists: ', response);
        });
      } else {
        Session.set('newDisValidate-header', false);
        $target.addClass('error-input');

      }
    },

    'keyup .create-new-discussion-body-input'(event) {
      const val = event.target.value;
      const $target = $('.create-new-discussion-body-input');

      if (val.search(/[^\n\s]/) != -1) {
        Session.set('newDisValidate-description', true);
        $target.removeClass('error-input');
      } else {
        Session.set('newDisValidate-description', false);
        $target.addClass('error-input');
      }
    }
});
