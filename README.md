# simplepp
Simple Preprocessor for Javascript

Back in the days of yore, C++ and C had a preprocessor
that was able to handle all sorts of meta programming
issues.

Today Javascript does not have such a preprocessor, but
it does have transcoders that serve a somewhat similar
purpose, converting code of one form to code of another
form.  Unfortunately those transformations do not
preserve the line numbering of the original code which
requires a sourcemap file to help understand how a
position in the new file corresponds to the source code
of the original file.  Additionally it seems that
some of these transcodings add odd procesures to the
call stack which can distract from the debugging
process.

This package creates a very simple preprocessor/transcoder
that does not change the line numbers of code and instead
just comments or uncomments code of files.

The basic idea is that 

```
    simplepp ~mjs cjs
```

will convert lines like

```
    import {dog} from './zoo.js'  //spp:mjs
    //spp:cjs const {dog} = require('./zoo.js')
```

```
    //spp:mjs import {dog} from './zoo.js'  
    const {dog} = require('./zoo.js')        //spp:cjs 
```

# installation
```
     npm install --global  simplepp
```
