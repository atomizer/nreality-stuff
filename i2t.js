var fs = require('fs')
var canvas = require('canvas')
var img2tiles = require('./img2tiles')

var img = new canvas.Image()
img.src = fs.readFileSync(process.argv[2])
process.stdout.write(img2tiles(img))
