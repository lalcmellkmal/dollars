var config = require('./config'),
    connect = require('connect'),
    fs = require('fs'),
    Handlebars = require('handlebars');

const WORDS = Object.freeze(require('./words'));
const INDEX_TMPL = templateSync('tmpl/index.html');

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

function templateSync(filename) {
	var raw = fs.readFileSync(__dirname + '/' + filename, 'utf8');
	return Handlebars.compile(raw);
}

function indexRoute(req, resp, next) {
	if (req.method == 'GET' && req.url == '/') {
		var html = INDEX_TMPL({
			hashString: generateRandomLog(),
			difficulty: 5,
		});
		resp.writeHead(200, {'Content-Type': 'text/html'});
		resp.end(html);
		return;
	}
	next();
}

function listen() {
	var app = connect.createServer();
	app.use(indexRoute);
	app.use(connect.static(__dirname + '/www'));
	app.listen(config.LISTEN_PORT);
}

if (require.main === module) {
	listen();
}
