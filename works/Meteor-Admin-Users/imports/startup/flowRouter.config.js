// import { Meteor } from 'meteor/meteor';
// import { Accounts } from 'meteor/accounts-base';

FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'mainTemplate'});
  }
});

FlowRouter.route('/profile', {
  triggersEnter: [checkLoggedIn],
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'profileTemplate'});
  }
});

FlowRouter.route('/admin', {
  triggersEnter: [checkLoggedInAdmin],
  action: function() {
    BlazeLayout.render('mainLayout', {content: 'adminTemplate'});
  }
});

FlowRouter.notFound = {
    // Subscriptions registered here don't have Fast Render support.
    subscriptions: function() {

    },
    action: function() {
      BlazeLayout.render('pageNotFound');
      console.log('page not found');
    }
};

function checkLoggedIn (ctx, redirect) {
  if (!Meteor.userId()) {
    redirect('/')
  }
}

function checkLoggedInAdmin (ctx, redirect) {
  if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), 'admin', 'users')) {
    redirect('/')
  }
}
