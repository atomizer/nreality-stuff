// bruteforce image -> tileset conversion

var Canvas = require('canvas')

var SX = [ 1,-1,-1, 1]
var SY = [-1,-1, 1, 1]

var TEST = {
	0: function() { return false }, // empty
	1: function() { return true },  // full
	2: function(x, y, t) { // 45 deg
		return x * SX[t] + y * SY[t] <= 0
	},
	6: function(x, y, t) { // concave
		var dx = SX[t] - x
		var dy = SY[t] - y
		return 4 <= dx * dx + dy * dy
	},
	10: function(x, y, t) { // convex
		var dx = - SX[t] - x
		var dy = - SY[t] - y
		return 4 >= dx * dx + dy * dy
	},
	14: function(x, y, t) {
		var dx = x - SX[t]
		var dy = y + SY[t]
		return dx * SX[t] + dy * SY[t] * 2 <= 0
	},
	18: function(x, y, t) {
		var dx = x + SX[t]
		var dy = y - SY[t]
		return dx * SX[t] + dy * SY[t] * 2 <= 0
	},
	22: function(x, y, t) {
		var dx = x + SX[t]
		var dy = y - SY[t]
		return dx * SX[t] * 2 + dy * SY[t] <= 0
	},
	26: function(x, y, t) {
		var dx = x - SX[t]
		var dy = y + SY[t]
		return dx * SX[t] * 2 + dy * SY[t] <= 0
	},
	30: function(x, y) { return y >= 0 }, // half
	31: function(x, y) { return x >= 0 },
	32: function(x, y) { return y <= 0 },
	33: function(x, y) { return x <= 0 }
}


function testfn(type) {
	if (type < 0 || type > 33) {
		throw new Error('bad tile type: ' + type)
	}
	if (type < 2 || type >= 30) return TEST[type]
	var normtype = ((type - 2) >> 2) * 4 + 2
	var t = type - normtype
	return function(x, y) {
		return TEST[normtype](x, y, t)
	}
}


var SSIZE // sampling resolution (SSIZE * SSIZE samples per tile)
var TILES // sample cache


function sample(fn, size) {
	size = size || 7
	var r = []
	var step = 2 / size
	for (var y = -1 + step / 2; y < 1; y += step) {
		for (var x = -1 + step / 2; x < 1; x += step) {
			r.push(+fn(x, y))
		}
	}
	return r
}

// init sample cache for this sample size
function maketilesamples(ssize) {
	SSIZE = ssize || SSIZE
	TILES = []
	for (var i = 0; i < 34; i++) {
		TILES.push(sample(testfn(i), ssize))
	}
}


function luma(p) {
	return p[0] * 0.3 + p[1] * 0.59 + p[2] * 0.11
}


function selectTile(data, cutoff, bans) {
	bans = bans || {}
	var d = {} // differences by tile type
	for (var t = 0; t < 34; t++) {
		d[t] = 0
	}

	var s = []
	for (var i = 0; i < data.length; i+= 4) {
		var p = [data[i], data[i+1], data[i+2], data[i+3]]
		var dthis = +(luma(p) < cutoff)
		// compare to tile samples
		for (var t = 0; t < 34; t++) {
			if (bans[t]) continue
			if (dthis != TILES[t][i >> 2]) d[t] += 1
		}
	}
	// console.log(d)
	// select the best tile
	var bsd = Infinity, bst
	for (var t = 0; t < 34; t++) {
		if (bans[t]) continue
		if (d[t] < bsd) {
			bsd = d[t]
			bst = t
		}
	}
	return bst
}


function convert(src, options) { // src is an Image or Canvas
	options = options || {}
	var defaults = {
		cutoff: 128, // points with luma lower than this are solid
		samplesize: 24,
		bans: {} // these tile types will not be considered
	}
	for (var k in defaults) {
		if (k in options) continue
		options[k] = defaults[k]
	}
	if (options.samplesize != SSIZE) { // rebuild cache if wrong size
		maketilesamples(options.samplesize)
	}
	var r = ''
	var c = new Canvas(SSIZE * 31, SSIZE * 23)
	var ctx = c.getContext('2d')
	ctx.drawImage(src, 0, 0, c.width, c.height)
	for (var x = 0; x < 31; x++) {
		for (var y = 0; y < 23; y++) {
			var d = ctx.getImageData(x * SSIZE, y * SSIZE, SSIZE, SSIZE)
			var t = selectTile(d.data, options.cutoff, options.bans)
			r += String.fromCharCode(48 + t)
		}
	}
	return r
}


module.exports = convert

