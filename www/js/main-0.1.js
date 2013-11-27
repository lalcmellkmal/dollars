(function () {

var WORKERS = [];
var LOG, DIFFICULTY, BEST, BEST_HASH, START_TIME;
var MESSAGE;

var $message;

function reset(log, difficulty) {
	LOG = log;
	DIFFICULTY = difficulty;
	BEST = 0;
	BEST_HASH = "";
	START_TIME = new Date();

	WORKERS.forEach(function (info) {
		info.worker.terminate();
	});
	WORKERS = [];
}

function spawn() {
	var worker = new Worker('js/miner/miner-0.1.js');
	worker.onmessage = onMessage;
	// onclose?
	worker.postMessage({
		log: LOG,
		difficulty: DIFFICULTY,
	});
	var info = {
		worker: worker,
		log: LOG,
		i: 0,
	};
	worker.minerInfo = info;
	WORKERS.push(info);
}

function onMessage(event) {
	var info = event.data;

	if (info.i)
		event.target.minerInfo.i = info.i;
	if (info.b && info.b > BEST) {
		BEST = info.b;
		BEST_HASH = info.h;
	}

	if (LOG && info.log === LOG) {
		redeem(info);
		reset();
	}

	if (info.i && info.i % 100 == 0) {
		// zombie paranoia
		var worker = event.target;
		if (worker.minerInfo.log !== LOG)
			worker.terminate();
	}

	renderStatus();
}

function totalIterations() {
	var i = 0;
	WORKERS.forEach(function (info) {
		if (info.log === LOG)
			i += info.i;
	});
	return i;
}

function redeem(info) {
	var ms = new Date().getTime() - START_TIME.getTime();
	var seconds = Math.floor(ms / 1000);
	var duration = seconds ? (seconds.toLocaleString() + ' seconds') : "???";
	var iterations = totalIterations().toLocaleString() + ' attempts';
	MESSAGE = "WINNING HASH FOUND after " + duration + " and " + iterations + ": " + info.hash;
}

function renderStatus() {
	var msg = MESSAGE;
	if (!msg) {
		var iterations = totalIterations().toLocaleString() + ' attempts';
		var stats = BEST + "/" + DIFFICULTY + " zeroes after " + iterations;
		msg = stats + " with best hash " + BEST_HASH + ".";
	}
	document.title = msg;
	if ($message) $message.textContent = msg;
}

function go() {
	var log = document.getElementById('log').textContent;
	if (!log) {
		alert("Can't find the log to hash, sorry!");
		return;
	}
	var difficulty = parseInt(document.getElementById('difficulty').textContent, 10);
	if (!difficulty) {
		alert("Can't figure out the current difficulty, sorry!");
		return;
	}
	reset(log, difficulty);
	for (var i = 0; i < 4; i++)
		spawn();
}

requirejs(['domReady'], function (domReady) {
	$message = document.getElementById('message');

	if (typeof Worker == 'undefined') {
		$message.textContent = "Your browser does not support Web Workers, sorry!";
		return;
	}

	go();
});

}());
