var ExtendableError = require.main.require('./sys/errors/ExtendableError');

module.exports = class BadRequestError extends ExtendableError {
	constructor(message) {
		super(message || 'Bad request');
		
		this.status = 400;
	}
};