var config = require('./config');

var R, PFX;

exports.issueLog = function (log, cb) {
	var ttl = 60 * 60;
	//var tmpId = Math.floor(Math.random() * Math.pow(10, 14));
	var m = R.multi();
	m.setex(PFX+'curLog', ttl, log);
	m.exec(function (err) {
		if (err) return cb(err);
		var m = R.multi();
		m.set(PFX+'tmp:');
	});
};

exports.getLog = function (cb) {
	R.get(PFX+'curLog', cb);
};

exports.verifyAnswer = function (answer, cb) {
};

exports.setup = function (cb) {
	PFX = global.redisPrefix = 'dd:';
	R = require('redis').createClient(config.REDIS_PORT);
	global.sharedRedis = R;
	R.on('connect', cb);
};
