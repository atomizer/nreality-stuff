A pile of assorted scripts that i wrote while making wonky NReality shit. To run or use anything you'll need NodeJS installed and run `npm install canvas` first

###`img2tiles.js`
image to tileset lib. Exports a function that takes Image or Canvas and options object (see the file for details)

###`i2t.js`
console wrapper for the above, run it like this: `node i2t.js pic.png > tiles.txt`

###`tscreen.js`
The arbitrary tileset animation lib demonstrated in metaballs map. See `metaballs.js` or `tscr-perftest.js` for usage examples.

###`tscr-perftest.js`
generates userlevels to test performance cap of tscreen-made maps. Writes to stdout, so redirect like `node tscr-perftest.js > userlevels.txt`

###`map.js`
just a little mapdata helper to have explicit names for the various bits and pieces

###`metaballs.js`
main script for the [metaballs map](http://www.nmaps.net/233847)

###`starfield.js`
main script for the old [starfield map](http://www.nmaps.net/214363), found it recently on the old notebook, posting as-is (its pretty bad haha)


license: ISC (feel free to use anything in any way you want, just give credit)
