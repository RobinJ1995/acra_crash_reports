var ExtendableError = require.main.require('./sys/errors/ExtendableError');

module.exports = class AccessDeniedError extends ExtendableError {
	constructor(message) {
		super(message || 'Access Denied');
		
		this.status = 403;
	}
};