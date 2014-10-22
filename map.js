var util = require('util')

function Map(options) {
	options = options || {}
	var defaults = {
		author: 'anonymous',
		name: 'unnamed',
		type: '',
		nrtype: '',
		tiles: Array(23 * 31 + 1).join('0'),
		objects: [],
		bg: '',
		fg: '',
		omods: [],
		pmods: [],
		areas: []
	}
	for (var k in defaults) {
		this[k] = options[k] || defaults[k]
	}
}

Map.prototype.toString = function(ned) {
	var r = [
		this.tiles,
		this.objects.join('!'),
		this.bg,
		this.fg,
		this.nrtype,
		this.omods.join(';'),
		this.pmods.join(';'),
		this.areas.join(';')
	].join('|')
	r = r.replace(/\|+$/, '')
	if (ned) return r
	return '$' + [this.name, this.author, this.type, r].join('#') + '#'
}

module.exports = Map
