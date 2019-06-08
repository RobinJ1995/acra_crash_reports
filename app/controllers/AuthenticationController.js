var Controller = require.main.require('./sys/http/controllers/Controller');
var UnauthorizedError = require.main.require('./sys/errors/UnauthorizedError');
var NotFoundError = require.main.require('./sys/errors/NotFoundError');
var User = require.main.require('./app/models/User');
var Promise = require('bluebird');
var Jwt = require('jsonwebtoken');

module.exports = class AuthenticationController extends Controller {
	static authenticate(req, res) {
		var _user;
		
		return Promise.delay(400)
			.then(() => User.where('username', req.body.username).first(req))
			.then(user => user.verifyPassword(req.body.password))
			.then(result => {
				if (!result)
					throw new UnauthorizedError('Wrong username/password');
				
				const jwtConfig = req.app.config.jwt.login;
				const strippedUser = _user.strip();
				const payload = {
					user: strippedUser
				};
				const token = Jwt.sign(payload, jwtConfig.secret, jwtConfig.options);
				const response = {
					token: token,
					user: strippedUser
				};
				
				return res.ok(response);
			})
			.catch(error => {
				if (error instanceof NotFoundError)
					return res.error(new UnauthorizedError('Wrong username/password'));
				
				return res.error(error);
			});
	}
};
