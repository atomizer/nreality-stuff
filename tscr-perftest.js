var util = require('util')
var Map = require('./map')
var Tscreen = require('./tscreen')

var seq = 'MIGKMIGKMIGK'

function genframe(fr) {
	var s = ''
	for (var x = 0; x < 31; x++) {
		var d = fr + (x % 2) * 2
		var r = seq.slice(8 - d, 12 - d)
		var c = ''
		while (c.length < 23) {
			c += r
		}
		s += c.slice(0, 23)
	}
	return s
}

var frames = []
for (var i = 0; i < 4; i++) frames.push(genframe(i))

var m = new Map({ author: 'atomizer', type: 'test' })
m.omods = ['122,r,0'] //['122,_xscale,10', '122,_yscale,10', '122,_color,0.0.0.255.0.0.100.0']


function testmap(w, h) {
	var v = {
		left: 15 - Math.floor(w/2),
		top: 11 - Math.floor(h/2)
	}
	v.right = v.left + w - 1
	v.bottom = v.top + h - 1

	var s = new Tscreen(v)
	s.fromFrames(frames, true)
	m.objects = s.pixels
	m.name = util.format('Tscreen: %sx%s, %s drones',
		w < 10 ? '0' + w : w, h < 10 ? '0' + h : h, s.pixels.length)
	m.objects.push('5^756,564', '11^756,564,756,36')
	return m.toString()
}

process.stdout.write('&userdata=\n')

for (var i = 3; i < 24; i += 1) {
	process.stdout.write(testmap(i, i) + '\n')
}
