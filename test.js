var walk = require('./krpanotools.js').walkMakePanoResult;
var createUploadKey = require('./krpanotools.js').createUploadKey;
var UploadQueue = require('./upload.js').UploadQueue;

var queue = new UploadQueue();
var prefix = '/resources/test';

walk('./pano-images/pano-2-1.tiles', function (images) {
  images.forEach(function (image) {
    queue.push(createUploadKey(prefix, 'p111', image), image.path);
  });
});
