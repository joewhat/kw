// import { Meteor } from 'meteor/meteor';
// import { Accounts } from 'meteor/accounts-base';

FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('mainLayout', {layer1: 'projectsTemplate'});
  }
});

FlowRouter.route('/templates', {
  triggersEnter: [checkLoggedIn],
  action: function() {
    BlazeLayout.render('mainLayout', {layer1: 'templatesTemplate'});
  }
});

FlowRouter.route('/approvals', {
  triggersEnter: [checkLoggedIn],
  action: function() {
    BlazeLayout.render('mainLayout', {layer1: 'approvalsTemplate'});
  }
});


FlowRouter.route('/revisionlog', {
  triggersEnter: [checkLoggedIn],
  action: function() {
    BlazeLayout.render('mainLayout', {layer1: 'revisionLogTemplate'});
  }
});

FlowRouter.route('/users', {
  triggersEnter: [checkLoggedInAdmin],
  action: function() {
    BlazeLayout.render('mainLayout', {layer1: 'usersTemplate'});
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
