import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './globalNavigation.component.html';

Template.globalNavigation.onRendered(function () {
  // set active tab on load
  if(FlowRouter.current().path === '/'){
      $( '.main-tab' ).addClass('tab-button-active');
  }else{
      $( '.' + FlowRouter.current().path.substring(1) + '-tab' ).addClass('tab-button-active');
  }
});
