module.exports = {
	LISTEN_PORT: 8000,
	TRUST_FORWARDED_FOR: false,

	REDIS_PORT: 6379,

	PERSONA_AUDIENCE: 'http://localhost:8000',
	SESSION_SECRET: 'keyboard cat',
	SESSION_TIME: 60*60*24*7,
};
