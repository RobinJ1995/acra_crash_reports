module.exports = class ExtendableError extends Error {
	constructor(message) {
		super(message);
		
		this.name = this.constructor.name;
	}
	
	toString() {
		return this.message;
	}
};