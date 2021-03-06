export const Images = new Meteor.Files({
  debug: true,
  collectionName: 'Images',
  allowClientCode: false, // Disallow remove files from Client
  storagePath: '/webapp/uploads',
  protected: true,
  onBeforeUpload: function (file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024*1024*3 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 3MB';
    }
  }
});

if (Meteor.isServer) {
  Images.denyClient();
  Meteor.publish('files.images.all', function () {
    return Images.find().cursor;
  });
}
