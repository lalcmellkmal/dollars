var config = require('./config'),
    crypto = require('crypto'),
    https = require('https'),
    querystring = require('querystring');

exports.route = function (req, resp, next) {
	var assertion = req.body.assertion;
	if (!assertion)
		return next(new Error("Missing assertion"));
	verifyAssertion(assertion, function (err, id, email) {
		if (err)
			return next(err);
		req.session.id = id;
		req.session.email = email;
		resp.send(200);
	});
};

function verifyAssertion(assertion, cb) {
	if (!assertion || typeof assertion != 'string')
		return cb('Bad Persona assertion.');
	var payload = new Buffer(querystring.stringify({
		assertion: assertion,
		audience: config.PERSONA_AUDIENCE,
	}), 'utf8');
	var opts = {
		host: 'verifier.login.persona.org',
		method: 'POST',
		path: '/verify',
		headers: {
			'Content-Length': payload.length,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	};
	var req = https.request(opts, function (verResp) {
		if (verResp.statusCode != 200) {
			console.error('Code', verResp.statusCode);
			return cb('Persona.org error.');
		}
		verResp.once('error', function (err) {
			console.error("Persona response error", err);
			cb("Couldn't read Persona.");
		});
		verResp.setEncoding('utf8');
		var answer = [];
		verResp.on('data', function (s) {
			answer.push(s);
		});
		verResp.once('end', function () {
			var packet = answer.join('');
			try {
				packet = JSON.parse(packet);
			}
			catch (e) {
				console.error('Bad packet:', packet);
				return cb('Received corrupt Persona.');
			}
			loadAccount(packet, cb);
		});
	});
	req.once('error', function (err) {
		console.error("Bad persona request", err);
		cb("Couldn't contact persona.org.");
	});
	req.end(payload);
}

function loadAccount(packet, cb) {
	if (!packet || packet.status != 'okay')
		return cb('Bad Persona.');
	if (packet.audience != config.PERSONA_AUDIENCE) {
		console.error("Wrong audience: " + packet.audience);
		return cb('Bad Persona audience.');
	}
	if (packet.expires && packet.expires < new Date().getTime())
		return cb('Login attempt expired.');

	var r = global.sharedRedis;
	var prefix = global.redisPrefix;
	r.hget(prefix+'userPersonas', packet.email, function (err, id) {
		if (err)
			return cb(err);
		var email = packet.email;
		if (id)
			return cb(null, id, email);
		/* create account */
		r.incr(prefix+'userCtr', function (err, id) {
			if (err)
				return cb(err);
			var m = r.multi();
			m.hset(prefix+'userPersonas', email, id);
			m.hset(prefix+'user:' + id, 'email', email);
			m.exec(function (err) {
				err ? cb(err) : cb(null, id, email);
			});
		});
	});
}
