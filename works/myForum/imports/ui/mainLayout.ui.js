import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './mainLayout.html';

// Components
import './components/globalNavigation.component.html';

// Pages
import './pages/login.page.html';
import './pages/main.page.html';
import './pages/users.page.html';
import './pages/modal/addUsers.page.html';
import './pages/modal/editUser.page.html';

// Controllers
import './pages/login.page.js';
import './pages/main.page.js';
import './pages/users.page.js';
import './pages/modal/addUsers.page.js';
import './pages/modal/editUser.page.js';
import './components/globalNavigation.component.js'

// Settings
Session.setDefault('modalLoad', '');
Session.setDefault('globalSearchValue', '');


Template.mainLayout.helpers({
  authInProcess: function() {
    return Meteor.loggingIn();
  },
  modal: function (){
    return Session.get('modalLoad');
  },
  clientName: function(){
    return Session.get('clientName');
  }
});



Template.mainLayout.events({
  'click .global-navigation-button'(event){
    const target = event.currentTarget;
    $('.tab-button-active').removeClass('tab-button-active');
    $(target).addClass('tab-button-active');
    FlowRouter.go(target.getAttribute('data-routerPath'));
    BlazeLayout.render('mainLayout', {layer1: target.getAttribute('data-templateToLoad')});
  },
  'click .close-modal'(event) {
    console.log('.close-modal');
    Session.set('modalLoad', '');
  },
});
