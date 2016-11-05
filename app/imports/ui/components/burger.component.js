import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './burger.component.html';

Template.burgerMenuTemplate.events({
    'click .burger-menu-icon'(event) {
        $this = $(event.target);
        $this.hide();
        $('.burger-menu-exit').show();
        $('.burger-menu-content').show();
    },

    'click .burger-menu-exit'(event) {
        $this = $(event.target);
        $this.hide();
        $('.burger-menu-icon').show();
        $('.burger-menu-content').hide();
    },

    'click .burger-menu-item'(event) {
        $('.burger-menu-exit').hide();
        $('.burger-menu-content').hide();
        $('.burger-menu-icon').show();
    },
});


Template.burgerMenuTemplate.onRendered(function () {
  // set active tab on load
  if(FlowRouter.current().path === '/'){
      $( '.main-tab' ).addClass('tab-button-active');
  }else{
      $( '.' + FlowRouter.current().path.substring(1) + '-tab' ).addClass('tab-button-active');
  }
});
