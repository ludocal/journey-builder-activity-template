'use strict';

module.exports = (body, secret, cb) => {
	if (!body) {
		return cb(new Error('invalid jwtdata'));
	}

	require('jsonwebtoken').verify(body.toString('utf8'), secret, {
		algorithm: 'HS256'
	}, cb);
};

module.exports = function verifySync(body, secret) {
	if (!body) {
		return new Error('invalid jwtdata');
	}

	return require('jsonwebtoken').verify(body.toString('utf8'), secret, {
		algorithm: 'HS256'
	});
};
