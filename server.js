var config = require('./config'),
    express = require('express'),
    fs = require('fs');

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
	return list[Math.floor(Math.random() * list.length)];
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
	resp.render('index', {
		hashString: generateRandomLog(),
		difficulty: 5,
	});
}

function listen() {
	var app = express();

	app.engine('html', require('consolidate').handlebars);
	app.set('view engine', 'html');
	app.set('views', __dirname + '/tmpl');

	app.get('/', indexRoute);
	app.use(express.static(__dirname + '/www'));
	app.listen(config.LISTEN_PORT);
	console.log('Listening on :' + config.LISTEN_PORT);
}

if (require.main === module) {
	listen();
}
