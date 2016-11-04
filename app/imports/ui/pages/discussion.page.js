import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Discussions } from '../../api/discus.api.js';
import { Comments } from '../../api/discus.api.js';
import { DiscussionUserMeta } from '../../api/discus.api.js';
import { Images } from '../../api/upload.api.js';
import './discussion.page.html';
import helpers from '../../api/helpers.api.js';

const Autolinker = require( 'autolinker' );
const pathLib = require('path');

// Meteor.subscribe('discussions.collection', function() {});
// Meteor.subscribe('comments.collection', function() {});
Meteor.subscribe('discussionUserMeta.collection', function() {});
Meteor.subscribe('files.images.all');


const PAGE_INC = 20;
Session.setDefault('discussion:loadContentLimit', PAGE_INC);
// Session.setDefault('discussion:loadingNewContent', false);
Session.setDefault('discussion:itsOkay', false);

Template.discussionPageTemplate.onCreated(function () {
  let template = Template.instance();

  template.loadContentLimit = new ReactiveVar(PAGE_INC);
  template.loadingNewContent = new ReactiveVar(false);
  template.hSubready = new ReactiveVar();
  template.commentsCount = new ReactiveVar();
  template.subRdy = new ReactiveVar(false);
  template.currentUpload = new ReactiveVar(false);
  template.firstLoad = new ReactiveVar(false);



  template.autorun( () => {
    template.subscribe( 'discussions.collection', () => {
    });

    template.commentsCount.set(Comments.find({discussionId : Session.get('activeDiscussionId')}).count());
    template.subscribe(
      'comments.collection',
      Session.get('activeDiscussionId'),
      template.loadContentLimit.get(),
       () => {


        if (template.subscriptionsReady()) {
          template.subRdy.set(true);

          if (template.loadingNewContent.get()) {
            // Remember this shit
            // console.log('subready - inner: ', template.hSubready.get());
            // console.log('h diff: ', hDiff);

            $('.discussion-msg-list').imagesLoaded( function() {
              template.hSubready.set($('.discussion-page-content')[0].scrollHeight);
              const hDiff = template.hSubready.get() - template.hLoadMore.get();
              // console.log(template.hSubready.get(), ' :hDiff: ', hDiff);
              // $('.discussion-page-content').animate({
              //    scrollTop: hDiff
              // }, 0, function(){
              // });
              $('.discussion-page-content').scrollTop(hDiff);
              loadingContent(false);
              template.loadingNewContent.set(false);
            });

            // $('.discussion-page-content').animate(
            //   { scrollTop:
            //     hDiff
            //   }, 400, function() {
            //     // animation done
            //   });
          } else {

            Meteor.defer(function() {

              $('.discussion-msg-list').imagesLoaded( function() {
                  // images have loaded
                  // console.log('images has loaded subready');
                  scrollDisListToBottom();
                  template.firstLoad.set(true);
                  loadingContent(false);
              });
            });
          }
        }
    });

    Meteor.defer(function() {
      // if (template.subRdy) {
      //   console.log('tring defer scroll');
      //   scrollDisListToBottom();
      //
      // }

        const $wrapper = $('.discussion-page-content');
        const $content = $wrapper.find('.discussion-msg-list');
        const topOffset = 100;
        const bottomOffset = 50;
        // console.log('wtf:', $wrapper);
        // scroll to bottom on rendered
        // scrollDisListToBottom();

        $wrapper.on('scroll', function(e) {
          // console.log('scrolling defer');
          const wrapperHeight = $wrapper.height();
          const contentHeight = $content.height();
          let calculation = $wrapper.scrollTop() + wrapperHeight;

          if (calculation > (contentHeight - bottomOffset)) {
            // At the bottom
            // console.log('is at the bottom! cal: ', calculation, ' cHight: ', contentHeight);
            Session.set('discussionScrollPosition', 'bottom');
          } else if ($wrapper.scrollTop() < topOffset) {

            // At the top
            Session.set('discussionScrollPosition', 'top');

            // load new content
            if (!template.loadingNewContent.get() && template.commentsCount.get() >= template.loadContentLimit.get()) {
                // Session.set('discussion:loadingNewContent', true);
                template.loadingNewContent.set(true);
                template.hLoadMore.set($('.discussion-page-content')[0].scrollHeight);
                template.hLoadMore.set($('.discussion-page-content')[0].scrollHeight);
                // console.log('msg-listH: ', $('.discussion-msg-list')[0].scrollHeight);
                // console.log('hLoadMore: ', template.hLoadMore.get());

                loadingContent(true);
                template.loadContentLimit.set(template.loadContentLimit.get() + PAGE_INC);
                // Session.set('discussion:loadContentLimit', Session.get('discussion:loadContentLimit') + PAGE_INC);
                // console.log('at the top! $wrapper.scrollTop: ', $wrapper.scrollTop(), ' cHight: ', contentHeight);
            }
          } else {
            // in the middle
            Session.set('discussionScrollPosition', 'middle');
            // console.log('$wrapper.scrollTop: ', $wrapper.scrollTop(), ' cHight: ', contentHeight);
          }
        });
        $('.the-comment').focus();
    });
  });



    const _thisData = {
        username : Meteor.user().username,
        discussionId : Session.get('activeDiscussionId')
    };
    // console.log('add-user-to-discussion: ', _thisData);

    Meteor.call('add-user-to-discussion', _thisData, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
      }
    });

    Meteor.call('clear-unread-comment-for-discussionId', _thisData, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
      }
    });

    Meteor.call('clear-is-discussion-new', _thisData, function( error, response ) {
      if ( error ) {
        // Handle our error.
        console.log('wtf: ' + error);
      } else {
      }
    });
});

Template.discussionPageTemplate.onDestroyed(function () {
    // remove user from Discussions collection userInDis
    if(Meteor.user()){
        const _thisData = {
            username : Meteor.user().username,
            discussionId : DiscussionUserMeta.find({username:Meteor.user().username}).fetch()[0].activeDiscussionId
        }

        // console.log('remove-user:', DiscussionUserMeta.find({username:Meteor.user().username}).fetch()[0].activeDiscussionId);

        Meteor.call('remove-user-from-discussion', _thisData, function( error, response ) {
          if ( error ) {
            // Handle our error.
            console.log('wtf: ' + error);
          } else {
              // console.log('remove user from dis');
          }
        });
        // reset active session id
        Session.set('activeDiscussionId', '');
    }
});

Template.discussionPageTemplate.onRendered(function () {
    let template = Template.instance();
    template.hLoadMore = new ReactiveVar();
    let addedUpdateCount = 0;
    const commentCount = Comments.find({discussionId : Session.get('activeDiscussionId')}).count();
    Session.set('discussionScrollPosition', 'bottom');
    Session.set('discussionScrollIsAnimating', false);
    // Session.set('discussionIsRendered', true);
    this.autorun(function(){
        Comments.find({discussionId : Session.get('activeDiscussionId')}).observeChanges({
            added: function(id, fields) {

                addedUpdateCount++;
                if(addedUpdateCount > commentCount){
                    // console.log('what thefuck: ' + addedUpdateCount + ' ' + commentCount);
                    // scroll to bottom after new msg
                    Tracker.afterFlush(function () {
                        // if (Session.get('discussionScrollPosition') == 'bottom') {
                          // scrollDisListToBottom(true);
                        // }
                        if (template.firstLoad.get() && !template.loadingNewContent.get()) {
                          $('.discussion-msg-list').imagesLoaded( function() {
                            // images have loaded
                            // console.log('comment added scroll');
                            scrollDisListToBottom(true);
                          });
                        }
                    });
                }
            },
            changed: function(id, fields) {
                // console.log('doc updated');
            },
            removed: function() {
                // console.log('doc removed');
            }
        });




    });


});

Template.discussionPageTemplate.events({
    // 'scroll .discussion-page-content'(event){
    //     console.log('scolling');
    // },

    'click .back-to-discussion-button'(event) {
        Session.set('discussionIsRendered', false);
        BlazeLayout.render('mainLayout', {layer1: 'mainPageTemplate'});
    },

    'click .add-comment-button'(event) {
        event.preventDefault();
        const data = $('.add-comment-form').serializeJSON();
        data.discussionId = Session.get('activeDiscussionId');

        // validate input
        if (data.comment.search(/[^\n\s]/) != -1) {
          data.comment = data.comment.replace(/\n/g, '<br/>');
          data.comment = Autolinker.link(data.comment, { stripPrefix: false,
            replaceFn : function( match ) {
              if (match.getType() == 'url') {
                // if img
                if (/\.(gif|png|jpe?g)$/i.test(match.getUrl())) {
                  return '<img src="' + match.getUrl() + '"/>';
                } else {
                  return true;
                }
              }
            }
          });

          Meteor.call('comments-insert', data, function( error, response ) {
            if ( error ) {
              // Handle our error.
              console.log('wtf: ' + error);
            } else {
              // Handle our return value.
              // console.log('comment response: ', response);

              const discussionHeader = Discussions.findOne({_id : Session.get('activeDiscussionId')}).header;
              //  console.log('discussionHeader: ', discussionHeader);
              const userUnreadData = {
                commentId: response,
                discussionName: discussionHeader
              };

              // console.log(userUnreadData);

              // Meteor.call('userUnread-insert', userUnreadData, function( error, response ) {
              //   if ( error ) {
              //     // Handle our error.
              //     console.log('wtf: ' + error);
              //   } else {
              //     // Handle our return value.
              //     // console.log('allusernames', response);
              //   }
              // });
            }
          });

          $('.the-comment').val('');
          $('.the-comment').focus();
          // scrollDisListToBottom(true);
          // Session.set('discussion:loadContentLimit', Session.get('discussion:loadContentLimit') + 1);

        } else {
          console.log('not cool');
        }


    },

    'change #fileInput': function (e, template) {
      if (e.currentTarget.files && e.currentTarget.files[0]) {
        // We upload only one file, in case
        // there was multiple files selected
        var file = e.currentTarget.files[0];
        if (file) {
          var uploadInstance = Images.insert({
            file: file,
            streams: 'dynamic',
            chunkSize: 'dynamic'
          }, false);

          uploadInstance.on('start', function() {
            template.currentUpload.set(this);
          });

          uploadInstance.on('end', function(error, fileObj) {
            if (error) {
              console.log('Error during upload: ' + error.reason);
            } else {
              const path = pathLib.join(
                fileObj._downloadRoute,
                'Images',
                fileObj._id,
                'original',
                fileObj._id + fileObj.extensionWithDot
              );
              // console.log('path: ', path);
              // console.log('File "' + fileObj.name + '" successfully uploaded', fileObj);
              $cArea = $('.the-comment');
              if ($cArea.val().length) {
                $cArea.val($cArea.val() + '\n<img src="' + path + '"/>');
              } else {
                $cArea.val($cArea.val() + '<img src="' + path + '" id="'+fileObj._id+'"/>');
              }
            }
            template.currentUpload.set(false);
          });

          uploadInstance.start();
        }
      }
    }
});



Template.discussionPageTemplate.helpers({
    disMeta : function(){
        return Discussions.findOne({_id : Session.get('activeDiscussionId')});
    },

    convertedDate : function(){
        return helpers.convertDate(disMeta.createdAt);
    },

    allComments : function(){
        // return Comments.find({discussionId : Session.get('activeDiscussionId')}, {sort: {createdAt: +1}});
        return Comments.find({}, {sort: {createdAt: +1}});
    },

    subRdy() {
      return Template.instance().subRdy.get();
    },

    currentUpload: function () {
      return Template.instance().currentUpload.get();
    },

    uploadedFiles: function () {
      console.log('uploadedFiles: ', Images.find());
      return Images.find();
    }
});

const loadingContent = function(loading = false) {
  if (loading) {
    $('.discussion-page-content').css('opacity', 0);
    $('.loading-dude').fadeIn(200);
  } else {
    $('.discussion-page-content').css('opacity', 1);
    // $('.loading-dude').css('display', 'inline-block');
    $('.loading-dude').hide();
  }
}

const scrollDisListToBottom = function(animate = false) {
  // console.log('scrollDisListToBottom: ', animate);
  Session.set('discussion:itsOkay', true);
  if (animate && !Session.get('discussionScrollIsAnimating')) {
    Session.set('discussionScrollIsAnimating', true);
    $('.discussion-page-content').animate(
      { scrollTop:
        $('.discussion-page-content').get(0).scrollHeight
      }, 400, function() {
        // Animation complete.
        Session.set('discussionScrollIsAnimating', false);
      });
  } else {
    $('.discussion-page-content').scrollTop(
      $('.discussion-page-content').get(0).scrollHeight);
  }
}
