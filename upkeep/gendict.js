function decide(word) {
	return word.length && !(/'s$/.test(word));
}
var words = require('fs').readFileSync(process.argv[2], 'utf8').split('\n').filter(decide);
console.log("/* " + words.length + " words */");
console.log("module.exports = " + JSON.stringify(words) + ";");
