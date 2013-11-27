var config = require('./config'),
    connect = require('connect');

function listen() {
	var app = connect.createServer();
	app.use(connect.static(__dirname + '/www'));
	app.listen(config.LISTEN_PORT);
}

if (require.main === module) {
	listen();
}
