var ExtendableError = require.main.require('./sys/errors/ExtendableError');

module.exports = class NotFoundError extends ExtendableError {
	constructor(message) {
		super(message || 'Item not found');
		
		this.status = 404;
	}
};