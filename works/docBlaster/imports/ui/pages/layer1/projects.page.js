import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './projects.page.html';


Template.projectsTemplate.events({
    'click .add-project-button'(event) {
        console.log('add project');
        Session.set('layer2Load', 'addProjectTemplate');
    },
});

Template.projectsTemplate.helpers({
  what : function(){

  },
});
