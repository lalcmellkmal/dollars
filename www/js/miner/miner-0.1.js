importScripts('keccak-ac7f114f.js');

function mine(log, difficulty) {
	// Nonce is 256 bits long. We'll do the first half constant random, second half incrementing.
	var rand = r32() + r32() + r32() + r32();
	var constant = log + rand;

	var best = 0;
	for (var i = 0; i < 0x100000000; i++) {
		var incr = String.fromCharCode(i>>24, (i>>16) & 0xff, (i>>8) & 0xff, i & 0xff);
		var hash = keccak(constant + incr);

		var c = -1;
		while (hash[++c] == '0');
		if (c >= difficulty) { // yatta
			postMessage({i: i, log: log, nonce: rand + incr, hash: hash});
			break;
		}
		else if (c > best) {
			best = c;
			postMessage({i: i, b: best, h: hash});
		}
		else if (i % 1000 == 0) {
			postMessage({i: i});
		}
	}
	// don't close immediately juuuuust in case
	setTimeout(self.close.bind(self), 200);
}

function r32() {
	var n = Math.floor(Math.random() * 0x100000000);
	return String.fromCharCode(n>>24, (n>>16) & 0xff, (n>>8) & 0xff, n & 0xff);
}

onmessage = function (event) {
	var config = event.data;
	setTimeout(mine.bind(null, config.log, config.difficulty), 0);
};
