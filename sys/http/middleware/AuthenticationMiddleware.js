const User = require.main.require('./app/models/User');
const JwtToken = require.main.require('./sys/http/JwtToken');
const AccessDeniedError = require.main.require('./sys/errors/AccessDeniedError');

module.exports = class AuthenticationMiddleware {
	static try(req, res, next) {
		try {
		return AuthenticationMiddleware._authenticate(req)
			.then(() => next())
			.catch(() => next());
		} catch (ex) {
			next();
		}
	}
	
	static user(req, res, next) {
		return AuthenticationMiddleware._authenticate(req)
			.then(() => next())
			.catch(error => res.error(error));
	}

	static admin(req, res, next) {
		return AuthenticationMiddleware._authenticate(req)
			.then(user => {
				if (!user.admin) {
					throw new AccessDeniedError();
				}

				return next();
			})
			.catch(error => res.error(error));
	}
	
	static _authenticate(req) {
		return JwtToken.find(req).decode(req.app.config.jwt.verify !== false ? req.app.config.jwt.login.secret : null)
			.then((decoded) => {
				if (req.app.config.db)
					return User.find(req.database, decoded.user.id);
				
				return Promise.resolve(decoded.user);
			})
			.then((user) => {
				req.user = user;

				return user;
			});
	}
};