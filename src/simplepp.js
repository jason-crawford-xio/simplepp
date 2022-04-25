/*
    Author : Jason Crawford
    Feature : A simple Javascript preprocessor
    Enviornment : nodejs
    Install: npm install -g simplepp
    Usage: simplepp <from> <to>
*/
//const net = require('net');
const fs = require('fs')
const readline = require('readline');


// Despite the name, it can also handle stdin/stdout if no parameters specified
function copyFiles(fromFile, toFile, uncomments, recomments) {
  let inStream = fromFile ? fs.createReadStream(fromFile) : process.stdin;
  let outStream = toFile ? fs.createWriteStream(toFile) : process.stdout;
  let lineReader = readline.createInterface({ input: inStream })
  lineReader.on('line', function(line){
    for (let key of uncomments) {
      // We uncomment lines.
      //   ex.    //spp:dog   my line is here       becomes      myline is here //spp:dog
      let regex = new RegExp('^(//spp:'+key+') (.*)$');
      let newstring = line.replace(regex,"$2 $1");  
      //if (newstring!==line) newstring = newstring.substring(0,newstring.length-1);  // remove the trailing space we just added by using $&
      line = newstring;
    }
    for (let key of recomments) {
      // We recomment lines.
      //   ex.    myline is here //spp:dog       becomes      //spp:dog   my line is here
      let regex = new RegExp(`^(.*) (//spp:${key})([ ]*)$`);
      let newstring = line.replace(regex,"$2 $1");  // syntax: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter
      //if (newstring!==line) newstring = newstring.substring(0,newstring.length-1);  // remove the trailing space we just added by using $&
      line = newstring;
    }
    if (toFile) {
      outStream.write(line);
      outStream.write('\n'); // TODO: detect and use whatever the original stream used
    } else {
      console.log(line);
    }
  })
}

function recursivelyCopyFiles(fromFile, toFile, uncomments, recomments, maxDepth=5) {
  // assert: fromFile is a directory name
  // assert: toFile is a directory name or non-existant
  if (maxDepth<0) throw new Error('max depth exceeded: '+fromFile+'   '+toFile);
  if (!fs.existsSync(toFile)) fs.mkdirSync(toFile, { recursive: true })
  let listOfFiles = fs.readdirSync( fromFile );
  //console.log('listOfFiles', listOfFiles);
  listOfFiles.forEach(file => {
    let fromFile2 = fromFile+'/'+file;    
    let toFile2 = toFile+'/'+file;
    if (fs.lstatSync(fromFile2).isDirectory()) {
      if (!fs.existsSync(toFile2)) {
        // no problem, we'll create it as a directory and then fill it
      } else if (fs.lstatSync(toFile2).isDirectory()) {
        // great, we'll fill it.
      } else {
        throw new Error('can not copy from directory to file: '+fromFile2+'   '+toFile2);
      }
      recursivelyCopyFiles(fromFile2,toFile2, uncomments, recomments, maxDepth-1);
    } else {
      if (!fs.existsSync(toFile2)) {
        // no problem, we'll create it as a directory and then fill it
      } else if (fs.lstatSync(toFile2).isDirectory()) {
        throw new Error('can not overwrite a directory with a file: from:'+fromFile2+'   to:'+toFile2);
      } else {
        // great, we'll overwrite it.
      }
      copyFiles(fromFile2,toFile2, uncomments, recomments);
    }
  });
}

function start() {
  let fromFile;
  let toFile;
  let recomments = [];
  let uncomments = [];

  //console.log('process.argv',process.argv)
  //ex.
  //    procsss.argv [ 'C:\\Program Files\\nodejs\\node.exe', 'C:\\Users\\xio\\AppData\\Roaming\\npm\\node_modules\\simplepp\\bin\\simplepp', 'ddd' ]
  
  // handle argument list
  try {
    let argv = process.argv;
    // validate and skip first argv parameter
    if (argv[0].endsWith('node.exe')) {
      argv = argv.slice(1)
    } else if (argv[0].endsWith('node')) {
      argv = argv.slice(1)
    } else {
      throw new Error('unfamiliar 0 parameter: '+argv);
    }
    // validate and skip next argv parameter
    if (argv[0].endsWith('simplepp')) {
      argv = argv.slice(1)
    } else {
      throw new Error('unfamiliar 1 parameter: '+argv);
    }
    if ((argv.length > 10) || (argv.length <1)) throw new Error('unsupported number of parameters');
    for (var ii = 0;  ii<argv.length; ii++) {
      let arg = argv[ii];
      if (arg.startsWith('--')) {
        const opt = arg;
        if (['--from','--to'].includes(opt)) {
          ii++;
          if (ii===argv.length) throw new Error('missing parameter after '+opt);
          let filename = argv[ii];
          if (filename.startsWith('-')) throw new Error('missing parameter after '+opt);
          if (filename.startsWith('+')) throw new Error('missing parameter after '+opt);
          if (opt==='--from') {
            if (fromFile) throw new Error('--from already specified');
            fromFile = filename;
          } else if (opt=='--to') {
            if (toFile) throw new Error('--to already specified');
            toFile = filename;
          } else {
          }
        } else {
          throw new Error('unfamiliar parameter: '+opt);
        }
      } else {
        let collection = uncomments;
        if (arg.startsWith('-')) {
          collection = recomments;
          arg = arg.substring(1);
        } else if (arg.startsWith('+')) {
          collection = uncomments;
          arg = arg.substring(1);
        } else {
          // We found that treating this as + was too error prone because people would add parameters incorrectly, so 
          // we now treat this as an error.
          throw new Error('unfamiliar parameter: '+arg)          
        }
        if (arg.match(/^[a-zA-Z_][a-zA-Z0-9-_]*$/)) {
          // okay, seems valid.   This check avoids the need to escape this value when placing it in a regex later in this impl
        } else {
          throw new Error('unsupported key: '+arg);
        }
        collection.push(arg);
      }
    }
    if (uncomments.length===0 && recomments.length===0) throw new Error('no + or - parameters provided');
    if (fromFile) {
      if (!fs.existsSync(fromFile)) throw new Error('file not found: '+fromFile);
      if (fs.lstatSync(fromFile).isDirectory()) {
        if (toFile) {
          if (!fs.existsSync(toFile)) {
            // ok.  We'll create the directory and then fill it
          } else if (fs.lstatSync(toFile).isDirectory()) {
            // ok.  We'll fill this directory
          } else {
            throw new Error('when --from is a directory, the destination is not allowed to be a file');
          }
        } else {
          throw new Error('when --from is a directory, the destination is not allowed to be stdout: '+fromFile);
        }
      }
    } else {
      if (toFile) {
        if (!fs.existsSync(toFile)) {
          // no problem.  We'll create the file and fill it
        } else {
          if (fs.lstatSync(toFile).isDirectory()) {
            throw new Error('if input is stdin, then output can not be a directory: '+toFile)
          }
        }
      } else {
        // no problem.  We'll route to stdout
      }
    }
  } catch (exc) {
    console.log(exc.message);
    console.log('Usage');
    console.log('    simplepp --from <from> --to <to>');
    console.log('  Example: ')
    console.log('    simplepp --from myInFile.js  --to myOutFile.js   -mjs  +cjs');
    process.exit(1);
  }
  {
    if (fromFile) {
      if (fs.lstatSync(fromFile).isDirectory()) {
        // we will need some special handling
        // assert: as a result of earlier checks we know that toFile is a directory or non-existant.
        recursivelyCopyFiles(fromFile, toFile, uncomments, recomments )
      } else {
        copyFiles(fromFile, toFile, uncomments, recomments);
      }
    } else {
      // input is stdin
      copyFiles(fromFile, toFile, uncomments, recomments);
    }
  }
}

exports.start = start;
