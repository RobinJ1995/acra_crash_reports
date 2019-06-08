const Query = require.main.require('./sys/database/queries/Query');
const ValidationError = require.main.require('./sys/errors/ValidationError');
const Uuid = require('node-uuid');

class Model {
	constructor(data, isNew = null, allowedFields = null) {
		this.load(data, allowedFields);
		
		if (isNew)
			this._isNew = true;
	}
	
	fields() {
		return this.constructor.fields();
	}
	
	fieldNames() {
		return this.constructor.fieldNames();
	}
	
	generatePrimaryKey() {
		let primaryKey;
		const primaryKeyField = this.fields()[this.primaryKeyField()];
		
		if (primaryKeyField.isUuid())
			primaryKey = Uuid.v4();
		else if (primaryKeyField.isInteger())
			primaryKey = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) + Number.MIN_SAFE_INTEGER;
		else if (primaryKeyField.isDate())
			primaryKey = new Date();
		else if (primaryKeyField.isString()) {
			primaryKey = '';
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			
			for (var i = 0; i < 32; i++)
				primaryKey += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		else
			throw new Error('Unsupported field type for primary key');
		
		this[this.primaryKeyField()] = primaryKey;
		
		return primaryKey;
	}
	
	generateUniquePrimaryKey(req) {
		const primaryKeyField = this.fields()[this.primaryKeyField()];
		if (primaryKeyField.isUuid()) {
			// Not paranoid enough for this. It's a UUID.
			return Promise.resolve(this.generatePrimaryKey());
		}

		return this.constructor.where(this.primaryKeyField(), this.generatePrimaryKey()).empty(req)
			.then(empty => {
				if (!empty)
					return this.generateUniquePrimaryKey(req);
				
				return this[this.primaryKeyField()];
			});
	}
	
	isNew() {
		return this._isNew || (this[this.primaryKeyField()] == null);
	}

	isFreeForm() {
		return this.constructor._freeForm;
	}
	
	primaryKeyField() {
		return this.constructor.primaryKeyField();
	}

	primaryKey() {
		return this[this.primaryKeyField()];
	}
	
	hasField(fieldName) {
		return this.fields()[fieldName] != null || this.isFreeForm();
	}
	
	load(data, allowedFields = null) {
		for (const prop in data) {
			if (this.hasField(prop)) {
				if (allowedFields !== null && !allowedFields.includes(prop)) {
					throw new Error(`Modifying the ${prop} field is not permitted`);
				}
				
				this[prop] = data[prop];
			}
		}

		return this;
	}
	
	strip(includeHidden) {
		if (this.isFreeForm()) {
			return JSON.parse(JSON.stringify(this));
		}

		const obj = {};
		const fields = this.fields();
		
		for (const fieldName in fields) {
			const field = fields[fieldName];
			
			if (!field.isHidden() || includeHidden)
				obj[fieldName] = this[fieldName];
		}
		
		return obj;
	}

	_getPresaveActions() {
		return [].concat(this.constructor.presave).concat(this.presave).filter(x => x);
	}
	
	prepareForSave(req) {
		const promises = [];
		const primaryKeyField = this.primaryKeyField();
		
		if (this.isNew()) {
			this.created_at = new Date();
			
			if (this[primaryKeyField] == null)
				return this.generateUniquePrimaryKey(req);
		}

		this._getPresaveActions().forEach(func =>
			promises.push(Promise.resolve(func.bind(this)(req)).then(ok => {
				if (!ok) {
					return new Error('Pre-save operation failed');
				}
			})));
		
		return Promise.all(promises).then(() => this[primaryKeyField]);
	}
	
	save(req) {
		const primaryKeyField = this.primaryKeyField();
		const isNew = this.isNew();

		return this.prepareForSave(req)
			.then(() => this.validate(req))
			.then(() => {
				this.updated_at = new Date();
				
				return req.database.collection(this.table())
					.updateOne(
						{
							[primaryKeyField]: this[primaryKeyField]
						},
						this.strip(true),
						{
							upsert: true
						}
					);
			})
			.then(r => {
				if (!r.result.ok)
					throw new Error('Database didn\'t acknowledge insert operation');
				
				return this;
			});
	}
	
	table() {
		return this.constructor.table();
	}
	
	remove(req) {
		const primaryKeyField = this.primaryKeyField();
		
		return req.database.collection(this.table())
			.removeOne({
				[primaryKeyField]: this[primaryKeyField]
			}).then(() => this);
	}
	
	validate(req) {
		const fields = this.fields();
		let chain = Promise.resolve(true);
		
		for (const fieldName in fields) {
			const field = fields[fieldName];
			
			chain = chain
				.then(() => {
					return field.validate(req, this, fieldName, this[fieldName]);
				})
				.then(valid => {
					if (!valid)
						throw new ValidationError('Data failed to pass validation');
				});
		}
		
		return chain;
	}
	
	static all(req, returnModelCollection) {
		const query = new Query(this);
		
		if (returnModelCollection)
			return query.execute(req);
		
		return query.get(req);
	}
	
	static fromDatabase(data) {
		const obj = new this(data);
		obj.load(data);
		
		return obj;
	}
	
	static hasMany(model2Name, local, foreign, methodName) {
		const HasManyRelation = require.main.require('./sys/database/relations/HasManyRelation');
		
		return new HasManyRelation(this, model2Name, local, foreign, methodName);
	}
	
	static hasOne(model2Name, local, foreign, methodName) {
		const HasOneRelation = require.main.require('./sys/database/relations/HasOneRelation');
		
		return new HasOneRelation(this, model2Name, local, foreign, methodName);
	}
	
	static fields() {
		return this._fields;
	}
	
	static fieldNames() {
		const fieldNames = [];
		
		for (const fieldName in this.fields())
			fieldNames.push(fieldName);
		
		return fieldNames;
	}
	
	static primaryKeyField() {
		const fields = this.fields();
		
		for (const fieldName in fields) {
			if (fields[fieldName].isPrimaryKey())
				return fieldName;
		}
	}
	
	static find(req, key) {
		return this.where(this.primaryKeyField(), key).first(req);
	}
	
	static save(req, ...models) {
		let chain = Promise.resolve(true);
		const saved = [];
		
		for (const model of models) {
			chain = chain
				.then(() => {
					return model.prepareForSave(req);
				})
				.then(() => {
					return model.validate(req);
				});
		}
		
		for (const model of models) {
			chain = chain
				.then(() => {
					return model.save(req)
						.then(() => {
							saved.push(model);
						})
						.catch(error => {
							return this.remove(req, saved)
								.then(() => {
									throw error;
								});
						});
				});
		}
		
		return chain;
	}
	
	static table() {
		return this._table;
	}
	
	static remove(req, ...models) {
		let chain = Promise.resolve(true);
		
		for (const model of models) {
			chain = chain.then(() => model.remove(req));
		}
		
		return chain;
	}
	
	static cleanup(req, ...models) {
		for (const model of models)
			try {
				model.remove(req).catch();
			} catch (ex) {
				// Don't care
			}
	}
	
	static where(field, operator, value) {
		const query = new Query(this);
		query.where(field, operator, value);
		
		return query;
	}
	
	static orderBy(sort) {
		const query = new Query(this);
		query.orderBy(sort);
		
		return query;
	}
	
	static limit(n) {
		const query = new Query(this);
		query.limit(n);
		
		return query;
	}

	static last(req) {
		// This is probably going to need a better implementation at some point. //
		const query = new Query(this);

		return query.last(req);
	}
}

module.exports = Model;