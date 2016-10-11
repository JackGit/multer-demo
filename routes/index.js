var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: 'uploads/'}).single('file');
var makePreview = require('../kr.js').makePreview;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/pano/upload', function (req, res) {
  upload(req, res, function (err) {
    if (err) return res.send('error uploading');
    console.log('file path', __dirname + '/../' + req.file.path);

    makePreview(__dirname + '/../' + req.file.path);
    res.send('uploaded');
  });
});

module.exports = router;
