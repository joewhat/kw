import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './mainLayout.html';

// Components
import './components/topbar.component.html';
import './components/globalNavigation.component.html';

// Pages
import './pages/layer1/login.page.html';
import './pages/layer1/projects.page.html';
import './pages/layer1/templates.page.html';
import './pages/layer1/approvals.page.html';
import './pages/layer1/revisionLog.page.html';
import './pages/layer1/users.page.html';
import './pages/modal/addUsers.page.html';
import './pages/modal/editUser.page.html';
import './pages/layer2/addProject.page.html';


import './pages/layer1/layerTests.html';

// Controllers
import './pages/layer1/login.page.js';
import './pages/layer1/projects.page.js';
import './pages/layer1/users.page.js';
import './pages/modal/addUsers.page.js';
import './pages/modal/editUser.page.js';
import './components/globalNavigation.component.js'
import './pages/layer2/addProject.page.js';

// Settings

Session.setDefault('clientName', 'DocBlaster Client');
Session.setDefault('layer2Load', '');
Session.setDefault('layer3Load', '');
Session.setDefault('modalLoad', '');
Session.setDefault('globalSearchValue', '');


Template.mainLayout.helpers({
  authInProcess: function() {
    return Meteor.loggingIn();
  },
  layer2: function (){
    return Session.get('layer2Load');
  },
  layer3: function (){
    return Session.get('layer3Load');
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

  // Layer test
  'click .start-layer2'(event) {
    Session.set('layer2Load', 'layer2TestTemplate');
  },
  'click .close-layer2'(event) {
    Session.set('layer2Load', '');
  },
  'click .open-layer3'(event) {
    Session.set('layer3Load', 'layer3TestTemplate');
  },
  'click .close-layer3'(event) {
    console.log('.close-layer3');
    Session.set('layer3Load', '');
  },
  'click .close-modal'(event) {
    console.log('.close-modal');
    Session.set('modalLoad', '');
  },
  // 'click .modal-wrapper'(event) {
  //   console.log('.close-modal');
  //   Session.set('modalLoad', '');
  // },

});
