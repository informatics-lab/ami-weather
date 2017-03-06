const fs = require('fs');
const path = require('path');

if (process.argv.length <= 2) {
    console.log(`Usage ${__filename} --dev`);
    process.exit(-1);
}
// --dev

const _mode = 'dist';
const _destRootDir = 'dist';
const _destFile = 'index.html';

const targetDir = 'examples/';
const destRootDir = _destRootDir;
const destFile = _destFile;
const destDir = path.join(destRootDir, targetDir);
const mode = _mode;
const ExampleTemplate = require('./templates/examples.js');

//
try {
  fs.statSync(destRootDir);
} catch(e) {
  fs.mkdirSync(destRootDir);
}

// <dev> or <dist> or <> / lessons
try {
  fs.statSync(destDir);
} catch(e) {
  fs.mkdirSync(destDir);
}

// parse target dir
fs.readdir(targetDir, function(e, files) {
  // each lesson directory
  files.forEach(function(file) {
    const lessonName = file;
    const lessonTargetDir = path.join(targetDir, lessonName);
    const lessonContentHMTL = path.join(lessonTargetDir, lessonName + '.html');
    const lessonDestDir = path.join(destDir, lessonName);
    const lessonDestFile = path.join(lessonDestDir, destFile);
    const toCopy = [];
    const dirContent = fs.readdirSync(lessonTargetDir);
    // Copy any extra static files
    for (var i = 0; i < dirContent.length; i++) {
      let file = dirContent[i];
      if(!fs.lstatSync(path.join(lessonTargetDir, file)).isDirectory()) {
        toCopy.push(file);
      }
    }

    const exampleTemplate = new ExampleTemplate.ExampleTemplate();
    exampleTemplate.name = lessonName;
    exampleTemplate.content = fs.readFileSync(lessonContentHMTL, 'utf8');

    // <dev> or <dist> or <> / lessons / <lessonName>
    try {
      fs.statSync(lessonDestDir);
    } catch(e) {
      fs.mkdirSync(lessonDestDir);
    }

    // copy static files to right location
    toCopy.forEach(function(file) {
      let targetFile = path.join(lessonTargetDir, file);
      let destFile = path.join(lessonDestDir, file);
      let rs = fs.createReadStream(targetFile);
      let ws = rs.pipe(fs.createWriteStream(destFile));
      rs.on('error', function(err) {
        console.log('Read: ' + targetFile, err);
        throw err;
      });
      ws.on('error', function(err) {
        console.log('Write: ' + destFile, err);
        throw err;
      });
    });

    fs.writeFile(lessonDestFile, exampleTemplate.html(), (err) => {
      if (err) throw err;
      console.log('Write: ' + lessonDestFile);
    });
  });
});
