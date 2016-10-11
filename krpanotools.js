var path = require('path');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var config = {
  krpanotoolsPath: './krpanotools',
};

/**
 * description: make a preview of a sphere image
 * example:
 *    makePreview('./test.jpg', '-cs')
 */
function makePreview (inputFile, options, onSuccess, onError) {
  var cmd = spawn(config.krpanotoolsPath, ['makepreview', inputFile].concat(options || ['-cs']));
  cmd.on('close', function (code) {
    if (code === 0) {
      var previewPath = inputFile.substring(0, inputFile.lastIndexOf('.')) + '_preview.jpg';
      onSuccess && onSuccess(previewPath);
    } else {
      console.warn('makePreview exits with error, exit code is ' + code);
      onError && onError(code);
    }
  });
}

/**
 * description: make a sphere image into tiles
 * example:
 *    makeTiles('./bigimage.jpg', 'tiles_%v_%h.jpg', 512)
 */
function makeTiles (inputFile, outputFile, tileSize, options, onSuccess, onError) {
  var cmd = spawn(config.krpanotoolsPath, ['maketiles', inputFile, outputFile, tileSize].concat(options || []));
  cmd.on('close', function (code) {
    if (code === 0) {
      onSuccess && onSuccess();
    } else {
      console.warn('makeTiles exits with error, exit code is ' + code);
      onError && onError(code);
    }
  });
}

/**
 * description: make pano from a input image
 * example:
 *    makePano('./bigimage.jpg', './multires.config')
 */
function makePano (inputFile, configFile, onSuccess, onError) {
    var configFilePath = configFile || config.krpanotoolsPath + '/templates/multires.config';
    var cmd = spawn(config.krpanotoolsPath, ['makepano', configFilePath, inputFile]);
    cmd.on('close', function (code) {
        if (code === 0) {
            onSuccess && onSuccess();
        } else {
          console.warn('makePano exits with error, exit code is ' + code);
          onError && onError(code);
        }
    });
}

/**
 * l1_f_1_2
 */
function parseTileName (name) {
  var info = {
    level: '',
    side: '',
    v: 0,
    h: 0
  };

  name.split('_').forEach(function (item, index) {
    switch (index) {
      case 0:
        info.level = item.substring(1);
        break;
      case 1:
        info.side = item;
        break;
      case 2:
        info.v = item;
        break;
      case 3:
        info.h = item;
        break;
      default:
        break;
    }
  });
  return info;
}

/**
 * "/path/to/a/pano.jpg" => "pano"
 */
function getFileName (filePath) {
  return path.basename(filePath, '.jpg');
}

function walkMakePanoResult (inputPath, onSuccess, onError) {
  var imgs = [/*{
    path: '',
    preview: false,
    mobile: '', // side label
    multires: {
      level: '',
      side: 'f',
      v: 1,
      h: 2
    }
  }*/];

  fs.walk(inputPath).on('data', function (item) {
      var fileName = getFileName(item.path);

      if (item.stats.isFile()) {
        console.log('file:', item.path);

        if (fileName.indexOf('preview') !== -1) {
          imgs.push({
            path: item.path,
            preview: true,
            mobile: '',
            multires: null
          });
        } else if (fileName.indexOf('mobile_') !== -1) {
          imgs.push({
            path: item.path,
            preview: false,
            mobile: fileName[7],
            multires: null
          });
        } else if (fileName.startsWith('l')) {
          imgs.push({
            path: item.path,
            preview: false,
            mobile: '',
            multires: parseTileName(fileName)
          });
        } else {
          console.warn('walkMakePanoResult() cannot process file', fileName);
        }
      }
    }).on('end', function () {
      console.log('end');
      onSuccess && onSuccess(imgs);
    });
}

function createUploadKey (prefix, id, image) {
    var key = prefix + '/' + id + '/imgs'; // /resources/prod/XXXX

    if (image.preview) {
      key += '/preview.jpg';
    } else if (image.mobile) {
      key += '/mobile/mobile_' + image.mobile + '.jpg';
    } else if (image.multires) {
      key += '/mres_'
              + image.multires.side
              + '/l' + image.multires.level
              + '/' + image.multires.v
              + '/l' + image.multires.level + '_' + image.multires.side + '_' + image.multires.v + '_' + image.multires.h + '.jpg';
    } else {
      console.warn('createUploadKey() cannot process image', image);
    }

    return key;
}

module.exports = {
  config: config,
  makePreview: makePreview,
  makeTiles: makeTiles,
  makePano: makePano,
  walkMakePanoResult: walkMakePanoResult,
  createUploadKey: createUploadKey
};
