import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Discussions } from '../../api/discus.api.js';
import './discussion.page.html';
import helpers from '../../api/helpers.api.js';

Meteor.subscribe('discussions.list', function() {});

Template.discussionPageTemplate.events({
    'click .back-to-discussion-button'(event) {
        BlazeLayout.render('mainLayout', {layer1: 'mainPageTemplate'});
    },
});

Template.discussionPageTemplate.helpers({
  disMeta : function(){
      return Discussions.findOne({_id : Session.get('activeDiscussionId')});
  },

});
