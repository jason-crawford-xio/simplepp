#!/bin/bash

NODECMD=node

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # ...
        :
elif [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OSX
        :
elif [[ "$OSTYPE" == "cygwin" ]]; then
        NODECMD=node.exe
elif [[ "$OSTYPE" == "msys" ]]; then
        # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
        NODECMD=node.exe
elif [[ "$OSTYPE" == "win32" ]]; then
        # I'm not sure this can happen.
        :
elif [[ "$OSTYPE" == "freebsd"* ]]; then
        # ...
        :
else
        # Unknown.
        :
fi

# Expected files were created with:
#   $NODECMD bin/simplepp --from testfiles/infile.txt -mjs +cjs  >testfiles/expected.plus.cjs.minus.mjs.txt
#   $NODECMD bin/simplepp --from testfiles/infile.txt -cjs +mjs  >testfiles/expected.plus.mjs.minus.cjs.txt

$NODECMD bin/simplepp --from testfiles/testfiles/test1.js -mjs +cjs     >actual.plus.cjs.minus.mjs.txt
$NODECMD bin/simplepp --from testfiles/testfiles/test1.js -cjs +mjs     >actual.plus.mjs.minus.cjs.txt
$NODECMD bin/simplepp --from testfiles/testfiles          -cjs +mjs --to actualfiles.plus.mjs.minus.cjs
$NODECMD bin/simplepp --from testfiles/testfiles          +cjs -mjs --to actualfiles.plus.cjs.minus.mjs

DIFFCMD1="diff actual.plus.cjs.minus.mjs.txt      testfiles/expected.plus.cjs.minus.mjs/test1.js"
DIFFCMD2="diff actual.plus.mjs.minus.cjs.txt      testfiles/expected.plus.mjs.minus.cjs/test1.js"
DIFFCMD3="diff -r actualfiles.plus.mjs.minus.cjs  testfiles/expected.plus.mjs.minus.cjs"
DIFFCMD4="diff -r actualfiles.plus.cjs.minus.mjs  testfiles/expected.plus.cjs.minus.mjs"
DIFF1=$(${DIFFCMD1})
DIFF2=$(${DIFFCMD2})
DIFF3=$(${DIFFCMD3})
DIFF4=$(${DIFFCMD4})

if [ "." = ".$DIFF1$DIFF2$DIFF3$DIFF4" ]; then 
  #echo "pass"
  :
  rc=0
  rm actual.plus.mjs.minus.cjs.txt
  rm actual.plus.cjs.minus.mjs.txt
  rm -Rf actualfiles.plus.mjs.minus.cjs
  rm -Rf actualfiles.plus.cjs.minus.mjs
else 
  #echo "fail"
  $DIFFCMD1
  $DIFFCMD2
  $DIFFCMD3
  $DIFFCMD4
  rc=2
fi
exit $rc

