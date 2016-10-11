var spawn = require('child_process').spawn;
var KRPANOTOOLS_PATH = '/etc/krpanotools/krpanotools';

module.exports.makePreview = function (filePath) {
  var cmd = spawn(KRPANOTOOLS_PATH, ['makepreview', filePath, '-cs']);
  cmd.stdout.on('data', function (data) {
    console.log('out', data);
  });
  cmd.on('close', function (code) {
    console.log('exit with code', code);
  });

  console.log('running krpanotools makepreview ' + filePath + ' -cs');
};
