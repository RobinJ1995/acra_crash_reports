var ExtendableError = require.main.require('./sys/errors/ExtendableError');

module.exports = class ConflictError extends ExtendableError {
	constructor(message) {
		super(message || 'Conflict');
		
		this.status = 409;
	}
};