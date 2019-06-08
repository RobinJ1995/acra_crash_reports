var Controller = require.main.require('./sys/http/controllers/Controller');
var ConflictError = require.main.require('./sys/errors/ConflictError');
var BadRequestError = require.main.require('./sys/errors/BadRequestError');
var ValidationError = require.main.require('./sys/errors/ValidationError');
var Validator = require('input-field-validator');
var User = require.main.require('./app/models/User');
var Promise = require('bluebird');

module.exports = class UserController extends Controller {
	static index(req, res) {
		return User.all(req)
			.then(users => {
				if (req.user) {
					return users.map(user => strip());
				}

				return users.map(({ id, username }) => ({ id, username }));
			})
			.then(users => res.ok(users))
			.catch(error => res.error(error));
	}

	static show(req, res) {
		return User.find(req, req.params.user_id)
			.then(user => res.ok(user.strip()))
			.catch(error => res.error(error));
	}
};
