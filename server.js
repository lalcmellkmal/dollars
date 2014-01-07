var config = require('./config'),
    crypto = require('crypto'),
    db = require('./db'),
    express = require('express'),
    fs = require('fs'),
    persona = require('./persona');

const WORDS = Object.freeze(require('./words'));

function generateRandomLog() {
	if (WORDS.length < 41000)
		throw new Error("Where did my words go?!");
	function w() { return randomChoice(WORDS); }
	for (var i = 0; i < 5; i++) {
		var wwww = [w(), w(), w(), w()];
		if (allDifferent(wwww))
			return wwww.join(' ');
	}
	throw new Error("Word diversity please!");
}

function randomChoice(list) {
	var n = list.length;
	var i = Math.floor(Math.random() * n);
	// attempt to mix some better randomness in
	// this probably introduces some slight bias at the
	// boundary due to the overflow check
	if (n > 256) {
		var c = crypto.randomBytes(1)[0];
		var mixed = i ^ c;
		if (mixed >= 0 && mixed < n)
			i = mixed;
	}
	return list[i];
}

function allDifferent(words) {
	var n = words.length;
	for (var i = 0; i < n-1; i++)
		for (var j = i+1; j < n; j++)
			if (words[i] == words[j])
				return false;
	return true;
}

function indexRoute(req, resp) {
	var email = req.session.email;
	resp.render('index', {
		hashString: generateRandomLog(),
		difficulty: 5,
		login: email || '',
	});
}

function redeemRoute(req, resp, next) {
	var redemption = req.body;
	console.log('got redemption', req.body);
	db.redeem(req.body, function (err, redeemed) {
		if (err)
			return next(err);
		if (redeemed)
			resp.send({redeemed: true, balance: 1});
		else
			resp.send({redeemed: false});
	});
}

function listen() {
	var app = express();

	app.engine('html', require('consolidate').handlebars);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/tmpl');

	var RedisStore = require('connect-redis')(express);
	app.use(express.urlencoded());
	app.use(express.json());
	app.use(express.cookieParser());
	app.use(express.session({
		cookie: {expires: config.SESSION_TIME},
		key: 'dollarsId',
		secret: config.SESSION_SECRET,
		proxy: config.TRUST_FORWARDED_FOR,
		store: new RedisStore({
			client: global.sharedRedis,
			prefix: global.redisPrefix + 'sess:',
		}),
	}));

	app.get('/', indexRoute);
	app.post(/^\/redeem$/, redeemRoute);
	app.post(/^\/persona$/, persona.route);
	app.use(express.static(__dirname + '/www'));

	app.listen(config.LISTEN_PORT);
	console.log('Listening on :' + config.LISTEN_PORT);
}

if (require.main === module) {
	db.setup(listen);
}
