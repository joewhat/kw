import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './mainLayout.html';

// Components
import './components/navigation.component.html';

// Pages
import './pages/login.page.html';
import './pages/main.page.html';
import './pages/profile.page.html';
import './pages/admin.page.html';

// Controllers
import './pages/login.page.js';
import './pages/admin.page.js';


Template.mainLayout.helpers({

});

Template.mainLayout.events({
  'click #main-page'(event) {
    FlowRouter.go('/');
    console.log('FlowRouter.current(): ', FlowRouter.current().path);
    BlazeLayout.render('mainLayout', {content: 'mainTemplate'});

  },
  'click #profile-page'(event) {
    FlowRouter.go('/profile');
    console.log('FlowRouter.current(): ', FlowRouter.current().path);
    BlazeLayout.render('mainLayout', {content: 'profileTemplate'});

  },
  'click #admin-page'(event) {
    FlowRouter.go('/admin');
    console.log('FlowRouter.current(): ', FlowRouter.current().path);
    BlazeLayout.render('mainLayout', {content: 'adminTemplate'});

  },
});
