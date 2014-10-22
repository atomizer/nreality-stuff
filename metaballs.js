var fs = require('fs')
var util = require('util')

var Canvas = require('canvas')

var i2t = require('./img2tiles')
var Map = require('./map')
var Tscreen = require('./tscreen')


var PI2 = Math.PI * 2

var N = 6 // ball count
var THR = 6 // field edge threshold
var STEPS = 40 * 8 // total frame count
var BEATS = 8 // control point count
var SW = 744, SH = 552 // rendered frame size

// control points
var points = []
for (var i = 0; i < N; i++) {
	points.push([])
	for (var k = 0; k < BEATS; k++) {
		var d = Math.sqrt(Math.random()) * 1.8
		var a = Math.random() * PI2
		points[i].push({
			x: Math.cos(a) * d,
			y: Math.sin(a) * d
		})
	}
}

function ease(a, b, t) {
	var c = b - a
	var tc = t * t * t
	return a + c * (6 * tc * t * t - 15 * tc * t + 10 * tc) // in-out quintic
}

function rotate(p, a) {
	return {
		x: Math.cos(a) * p.x - Math.sin(a) * p.y,
		y: Math.sin(a) * p.x + Math.cos(a) * p.y
	}
}

function pos(i, t) {
	var beat = Math.floor(t * BEATS)
	var t2 = t * BEATS - beat // current position within the beat
	var p1 = points[i][beat]
	var p2 = points[i][beat + 1 >= BEATS ? 0 : beat + 1]
	var a = t * PI2
	p1 = rotate(p1, a * (i - N/2))
	p2 = rotate(p2, a * (i - N/2))
	return {
		x: ease(p1.x, p2.x, t2),
		y: ease(p1.y, p2.y, t2)
	}
}

function q(x, y, t) {
	var s = 0
	for (var i = 0; i < N; i++) {
		var p = pos(i, t)
		var r2 = (x - p.x) * (x - p.x) + (y - p.y) * (y - p.y)
		s += 1 / Math.sqrt(r2)
	}
	//s += 0.2 / Math.abs(Math.abs(y) - 1.1) // add field at y = +-1
	return s
}

function frame(t) {
	var c = new Canvas(SW, SH)
	var ctx = c.getContext('2d')
	var d = ctx.getImageData(0, 0, c.width, c.height)
	for (var i = 0; i < SW * SH * 4; i += 4) {
		var xs = (i >> 2) % SW
		var ys = Math.floor((i >> 2) / SW)
		var x = (xs * 4 / SW - 2) * SW / SH
		var y = ys * 4 / SH - 2
		if (q(x, y, t) < THR) {
			d.data[i] = d.data[i+1] = d.data[i+2] = 255
		}
		d.data[i+3] = 255
	}
	ctx.putImageData(d, 0, 0)
	/*ctx.fillStyle = '#ffffff'
	ctx.fillRect(0, 0, SW, SH)
	ctx.fillStyle = 'black'
	ctx.rotate(0.3)
	ctx.scale(SH, SH)
	var w = 0.15
	t--
	while (t < 2) {
		ctx.fillRect(t, -1, w, 3)
		ctx.fillRect(-1, t, 3, w)
		t+= 0.5
	}*/
	return c
}


// banned tile types
var bans = {}
for (var i = 6; i < 10; i++) bans[i] = true // concave (type 4)


var frames = []

console.log('rendering frames')
for (var i = 0; i < STEPS; i++) {
	var f = frame(i / STEPS)
	frames.push(f)
//	fs.writeFileSync(util.format('frame%s.png', i < 10 ? '00' + i : (i < 100 ? '0' + i : i)), f.toBuffer())
	process.stdout.write('.')
}
console.log()

console.log('converting to tiles')
for (var i = 0; i < frames.length; i++) {
	frames[i] = i2t(frames[i], { bans: bans, samplesize: 10 })
	process.stdout.write('.')
}
console.log()


var m = new Map({ author: 'atomizer', type: 'demo', name: 'metaballs' })
//m.tiles = frames[frames.length - 1]
m.omods = ['122,r,0']
//m.omods = ['122,_xscale,10', '122,_yscale,10', '122,_color,0.0.0.255.0.0.100.0']


console.log('making animation')

var s = new Tscreen()
s.fromFrames(frames, true)

console.log('%s drones', s.pixels.length)


m.objects = s.pixels
m.objects.push('5^756,564')

//m.objects.push('6^36,36,


fs.writeFileSync('c:/temp/Nreality6g2/userlevels.txt', '&userdata=\n' + m.toString())
