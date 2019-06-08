var ExtendableError = require.main.require('./sys/errors/ExtendableError');

module.exports = class ValidationError extends ExtendableError {
	constructor(message, validator) {
		if (message.constructor.name === 'Validator') {
			validator = message;
			message = validator.errors.join('\n');
		}
		
		super(message || 'Input failed to pass validation');
		
		if (validator) {
			this.data = {
				validation_errors: validator.errors,
				fields: validator.fieldErrors
			};
		}
		
		this.status = 409;
	}
};