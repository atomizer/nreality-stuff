module.exports = Tscreen

// ZERO: coords of a place for drones to no-op at.
// Can be any unused tile *inside* the playable frame (setting this
// to outside gives unpredictable results due to bad coding of the engine)
var ZERO = '36.36'

function Tpixel() {
	this.tiles = ''
	this.coords = []
	this.ctilex = this.ctiley = this.ftilex = this.ftiley = -1
}

Tpixel.prototype.toString = function() {
	return '6^0,0,0,0,122,0^,,' + this.tiles + '^^' + this.coords.join(':') + ',8,0,9e9'
}

function Tscreen(bounds) {
	var maxbounds = { left: 0, top: 0, right: 30, bottom: 22 }
	if (!bounds) bounds = {}
	for (var k in maxbounds) {
		if (isNaN(bounds[k])) bounds[k] = maxbounds[k]
	}
	this.bounds = bounds
	this.pixels = []
	this.frameid = 0
	this.prevframe = Array(23 * 31 + 1).join('0')
}

Tscreen.prototype.fromFrames = function(frames, loop) {
	if (loop) this.prevframe = frames[frames.length - 1]
	for (var i = 0; i < frames.length; i++) {
		this.addFrame(frames[i])
	}
	this.finalize()
}

Tscreen.prototype.addFrame = function(tiles) {
	if (!this.frameid) this.firstframe = tiles
	for (var i = 0; i < tiles.length; i++) {
		var tx = Math.floor(i / 23)
		var ty = i % 23
		if (tx < this.bounds.left ||
			ty < this.bounds.top ||
			tx > this.bounds.right ||
			ty > this.bounds.bottom) continue
		if (tiles[i] != this.prevframe[i]) {
			this.changePixel(tx, ty, tiles[i])
		}
	}
	var self = this
	// no-op all the pixels that were not used
	this.pixels.forEach(function(p) {
		var c = p.coords
		if (c.length > self.frameid) return // used
		if (c[c.length - 1] != ZERO) p.tiles += '0' // for eventual jump out of hiding
		c.push(ZERO) // hide
		p.ctilex = p.ctiley = -1
	})
	this.frameid++
	this.prevframe = tiles
}

Tscreen.prototype.changePixel = function(tx, ty, tile) {
	var pix = null
	// select a drone to use from existing
	for (var i = 0; i < this.pixels.length; i++) {
		var p = this.pixels[i]
		if (p.coords.length > this.frameid) continue // already used in this frame
		if (p.ctilex == tx && p.ctiley == ty) continue // cant use twice in a row on same tile
		if (p.ftilex == tx && p.ftiley == ty) continue // dont use on same tile as the first one (loop collisions)
		pix = p
		break
	}
	// otherwise, create new one
	if (!pix) {
		pix = new Tpixel()
		for (var k = 0; k < this.frameid; k++) { // sync frame number
			pix.coords.push(ZERO)
		}
		if (this.frameid > 0) pix.tiles = '0' // for the first jump
		this.pixels.push(pix)
	}
	// apply the pixel
	pix.tiles += tile
	pix.ctilex = tx
	pix.ctiley = ty
	if (this.frameid <= 0) {
		pix.ftilex = tx
		pix.ftiley = ty
	}
	var c = [tx * 24 + 36, ty * 24 + 36].join('.')
	pix.coords.push(c)
}

Tscreen.prototype.finalize = function() {
	this.pixels.forEach(function(p) {
		var fc = p.coords[0], lc = p.coords[p.coords.length - 1]
		if (fc == ZERO && lc == ZERO && p.tiles.slice(-1) == '0') {
			p.tiles = p.tiles.slice(0, -1) // remove last preemptive jump
		}
	})
}
