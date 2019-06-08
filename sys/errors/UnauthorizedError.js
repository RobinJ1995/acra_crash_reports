var ExtendableError = require.main.require('./sys/errors/ExtendableError');

module.exports = class UnauthorizedError extends ExtendableError {
	constructor(message) {
		super(message || 'Unauthorized');
		
		this.status = 401;
	}
};