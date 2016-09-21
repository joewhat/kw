// UsersTemplate
Template.editUserTemplate.events({
    'click .close-editUser-button'(event) {
      Session.set('modalLoad', '');
    },
});

Template.editUserTemplate.helpers({
    userNameToEdit : function(){
        return Meteor.users.findOne( { _id: Session.get('editUserId') } ).username;
    }
});
