var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = '8RflFd93xHYRl6hFMJJ-dMeMaBiJtwfqj6lUt9qy';
qiniu.conf.SECRET_KEY = 'dCd4aLlp4o6SfOuRbuydGiZyin85KLM8-lzvXIge';

var bucket = 'pano';
var count = 0;

function token (bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket + ':' + key);
  return putPolicy.token();
}

function uploadToPano (key, localFile) {
  var tkn = token(bucket, key);
  var uptoken = tkn;
  var extra = new qiniu.io.PutExtra();
  count ++;
  qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
    if (!err) {
      count --;
      console.log('upload succeed', count);
    } else {
      console.log('failed, count = ' + count);
      console.log('upload error', err);
    }
  });
}

module.exports.uploadToPano = uploadToPano;
