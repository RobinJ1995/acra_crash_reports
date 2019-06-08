var FieldDataType = require.main.require('./sys/database/fields/FieldDataType');
var Validator = require('input-field-validator');
var ValidationError = require.main.require('./sys/errors/ValidationError');
var ConflictError = require.main.require('./sys/errors/ConflictError');
var Promise = require('bluebird');

module.exports = class Field {
	constructor() {
		this._primaryKey = false;
		this._required = false;
		this._unique = false;
		this._hidden = false;
		this._exists = null;
		this._type = null;
	}
	
	primaryKey() {
		this._primaryKey = true;
		this._required = true;
		this._unique = true;
		
		return this;
	}
	
	required() {
		this._required = true;
		
		return this;
	}
	
	unique() {
		this._unique = true;
		
		return this;
	}
	
	hidden() {
		this._hidden = true;
		
		return this;
	}

	exists(otherModel) {
		this._exists = otherModel;

		return this;
	}
	
	uuid() {
		this._type = FieldDataType.uuid;
		
		return this;
	}
	
	string() {
		this._type = FieldDataType.string;
		
		return this;
	}
	
	integer() {
		this._type = FieldDataType.integer;
		
		return this;
	}
	
	number() {
		this._type = FieldDataType.number;
		
		return this;
	}
	
	boolean() {
		this._type = FieldDataType.boolean;
		
		return this;
	}
	
	crypt() {
		this._type = FieldDataType.crypt;
		
		return this;
	}
	
	date() {
		this._type = FieldDataType.date;
		
		return this;
	}
	
	object() {
		this._type = FieldDataType['object'];

		return this;
	}

	array() {
		this._type = FieldDataType['array'];

		return this;
	}

	withValidators(validators) {
		this.validators = validators;
	}
	
	isPrimaryKey() {
		return this._primaryKey;
	}
	
	isRequired() {
		return this._required;
	}
	
	isUnique() {
		return this._unique;
	}
	
	isHidden() {
		return this._hidden;
	}
	
	isUuid() {
		return this._type.name == 'uuid';
	}
	
	isString() {
		return this._type.name == 'string';
	}
	
	isInteger() {
		return this._type.name == 'integer';
	}
	
	isBoolean() {
		return this._type.name == 'boolean';
	}
	
	isCrypt() {
		return this._type.name == 'crypt';
	}
	
	isDate() {
		return this._type.name == 'date';
	}
	
	validate(req, model, name, value) {
		const validators = [].concat(this._type.validators).concat(this.validators).filter(x => x);
		validators.unshift(this._required ? 'required' : 'optional');
		const validator = new Validator.FieldValidator(name, value, validators, model);
		
		return Promise.resolve(validator.validate())
			.then(valid => {
				if (!valid)
					throw new ValidationError(validator.error);
				
				if (this._unique)
					return model.constructor.where(name, value).where(model.primaryKeyField(), '!=', model[model.primaryKeyField()]).empty(req);
				
				return true;
			})
			.then(empty => {
				if (!empty)
					throw new ConflictError(`${name} is already used`);
				
				if ((this._required || value) && this._exists) {
					const otherModel = require.main.require('./app/models/' + this._exists);
					return otherModel.where(otherModel.primaryKeyField(), value).count(req);
				}

				return true;
			}).then(exists => {
				if (!exists)
					throw new ValidationError(`${name} does not exist`);

				return true;
			});
	}
};