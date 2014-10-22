var XMIN = 6, XMAX = 774, YMIN = 12, YMAX = 600-12;
//var XMIN = 100, XMAX = 700, YMIN = 100, YMAX = 500;
var LENGTH = (YMAX - YMIN) * 2 + (XMAX - XMIN) * 4;

var TOFFSET = 420;

var N = 100;
var SLICES = 16;
var MINR = 0, DR = 10;
var MINZ = 4, MAXZ = 20;

var map = {name: 'starfield', type: 'animation'};
map.objects = ['5^84,564', '1^396,180', '11^396,11,396,20'];
map.omods = ['4,_color,0.0.0.0.0.0.0.255', '4,_width,900', '4,_height,900'];

for (var j = 1; j <= SLICES; j++) {
	var t = TOFFSET + j;
	map.omods.push(t + ',_color,0.255.0.255.0.255.0.255');
	map.omods.push(t + ',r,' + (MINR + DR * j / SLICES));
}

for (var i = 0; i < N; i++) {
	var coords = [];
	
	// QUESTIONABLE
	var z = Math.sqrt(Math.random() * (MAXZ*MAXZ - MINZ*MINZ) + MINZ*MINZ);
	var speed = Math.round(100 * 1/z)/10;
	
	var type = TOFFSET + Math.ceil(SLICES * MINZ/z);
	
	// form an 8 shape
	var y1 = Math.round(Math.random() * (YMAX-YMIN)) + YMIN, y2 = YMAX - y1 + YMIN;
	coords.push([XMAX, y1]);
	coords.push([XMIN, y1]);
	coords.push([XMIN, YMIN]);
	coords.push([XMAX, YMIN]);
	coords.push([XMAX, y2]);
	coords.push([XMIN, y2]);
	coords.push([XMIN, YMAX]);
	coords.push([XMAX, YMAX]);
	// get initial position
	var pos = Math.random() * LENGTH;
	function dist01() {
		var dx = coords[0][0] - coords[1][0];
		var dy = coords[0][1] - coords[1][1];
		return Math.sqrt(dx * dx + dy * dy);
	}
	var d;
	while((d = dist01()) < pos) {
		pos -= d;
		coords.push(coords.shift());
	}
	pos /= d;
	var x = Math.round(coords[1][0] * pos + coords[0][0] * (1 - pos));
	var y = Math.round(coords[1][1] * pos + coords[0][1] * (1 - pos));
	coords.push(coords.shift());
	coords.unshift([x, y]);
	// construct object string
	for (var j = 0; j < coords.length; j++) coords[j] = coords[j].join('.');
	var s = [x, y, 0, 0, type, 0].join(',');
	s = [6, s, '', '', coords.join(':') + ',8,,' + speed].join('^');
	map.objects.push(s);
}

console.log(mapdata(map));



// this should be a module maybe

function mapdata(m, full) {
	var defaults = {
		'author': 'atomizer',
		'name': 'unnamed',
		'type': 'none',
		'nrtype': '',
		'tiles': Array(23 * 31 + 1).join('0'),
		'objects': [],
		'bg': '', 'fg': '',
		'omods': [],
		'pmods': [],
		'areas': []
	};
	for (var k in defaults) if (!m[k]) m[k] = defaults[k];
	var r = [
		m.tiles,
		m.objects.join('!'),
		m.bg, m.fg,
		m.nrtype,
		m.omods.join(';'),
		m.pmods.join(';'),
		m.areas.join(';')
	].join('|');
	r = r.replace(/\|+$/g, '');
	return full ? '$' + [m.name, m.author, m.type, r].join('#') : r;
}
