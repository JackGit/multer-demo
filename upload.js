var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = '8RflFd93xHYRl6hFMJJ-dMeMaBiJtwfqj6lUt9qy';
qiniu.conf.SECRET_KEY = 'dCd4aLlp4o6SfOuRbuydGiZyin85KLM8-lzvXIge';

var bucket = 'pano';
var uploadQueue = [];
var max = 10;

function token (bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket + ':' + key);
  return putPolicy.token();
}

function uploadToPano (key, localFile, onSuccess, onError) {
  var tkn = token(bucket, key);
  var uptoken = tkn;
  var extra = new qiniu.io.PutExtra();

  qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
    if (!err) {
      console.log('upload succeed');
      onSuccess && onSuccess();
    } else {
      console.log('upload error', err);
      onError && onError();
    }
  });
}

function push (key, localFile) {
  if (uploadQueue.length < max) {
    uploadToPano(key, localFile, function () {}, function () {});
  } else {
    uploadQueue.push({key: key, localFile: localFile});
  }
}

function UploadQueue () {
    this.queue = [];
    this.maxQueueSize = 500;
    this.cocurrent = 0;
    this.maxCocurrent = 10;
}

UploadQueue.prototype.push = function (key, localFile) {
  var that = this;
  if (this.queue.length === 500) {
    console.warn('reach max size of queue, emit more inputs');
  } else {
    this.queue.push({key: key, localFile: localFile});
    setTimeout(function () {
      that.consume();
    }, 0);
  }
};

UploadQueue.prototype.consume = function () {
  var that = this;
  var item;

  if (that.cocurrent >= that.maxCocurrent) {
    console.log('reach max cocurrent', 'queue size', that.queue.length, 'cocurrent', that.cocurrent);
    return;
  }

  item = this.queue.shift();

  if (item) {
    that.cocurrent ++;
    console.log('consuming', 'queue size', that.queue.length, 'cocurrent', that.cocurrent);
    uploadToPano(item.key, item.localFile, function () {
      console.log('upload done', 'queue size', that.queue.length, 'cocurrent', that.cocurrent);
      that.cocurrent --;
      that.consume();
    }, function () {
      that.cocurrent --;
      that.consume();
    });
  } else {
    console.log('queue items are all consumed');
  }
};

module.exports.uploadToPano = uploadToPano;
module.exports.UploadQueue = UploadQueue;
