var Jwt = require('jsonwebtoken');
var Promise = require('bluebird');

module.exports = class JwtToken {
	constructor(token) {
		this.token = token;
	}
	
	decode(secret) {
		if (secret) // Verify //
			return this.verify(secret);
		
		return Promise.resolve(Jwt.decode(this.token));
	}
	
	verify(secret) {
		return Promise.promisify(Jwt.verify)(this.token, secret);
	}
	
	static find(req, returnNullOnFailure) {
		let token;
		
		if (req.headers.authorization) {
			const header = req.headers.authorization.split(' ');
			
			if (header[0] != 'Bearer')
				throw new Error('Bearer attribute missing');
			else if (!header[1])
				throw new Error('Token missing');
			
			token = header[1];
		}
		else if (req.body.token) {
			token = req.body.token;
		}
		else if (req.cookies && req.cookies.auth && req.cookies.auth.token) {
			token = req.cookies.auth.token;
		}
		
		if (token)
			return new JwtToken(token);
		
		if (returnNullOnFailure)
			return null;
		
		throw new Error('Authentication token missing');
	}
};