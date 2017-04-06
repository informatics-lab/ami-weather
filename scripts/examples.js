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
    //const toCopy = [];
    //const dirContent = fs.readdirSync(lessonTargetDir);

    // Copy any extra static files
    function dirToFiles(dir, prefix) {
      prefix = prefix || '';
      let dirContent = fs.readdirSync(dir);
      let files = [];
      let toCopy = [];
      for (let i = 0; i < dirContent.length; i++) {
        let item = dirContent[i];
        let itempath = path.join(dir, item);
        if(!fs.lstatSync(itempath).isDirectory()) {
          toCopy.push(prefix + item);
        } else {
          let subfiles = dirToFiles(itempath, item + '/');
          for (let j = 0; j < subfiles.length; j++) {
            toCopy.push(subfiles[j]);
          }
        }
      }
      return toCopy;
    }

    // for (var i = 0; i < dirContent.length; i++) {
    //   let file = dirContent[i];
    //   if(!fs.lstatSync(path.join(lessonTargetDir, file)).isDirectory()) {
    //     toCopy.push(file);
    //   }
    // }
    let toCopy = dirToFiles(lessonTargetDir);
    console.log(toCopy);

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
      console.log('to copy file',file,lessonTargetDir,lessonDestDir);
      let targetFile = path.join(lessonTargetDir, file);
      let destFile = path.join(lessonDestDir, file);
      if(file.split('/').length > 1){
        // Need to create a sub folder.
        let bits = file.split('/');
        delete bits[bits.length -1];
        let dir = path.join(lessonDestDir, bits.join('/'));
        if(!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
      }
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
