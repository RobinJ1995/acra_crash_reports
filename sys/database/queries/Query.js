var ModelCollection = require.main.require('./sys/database/models/ModelCollection');
var NotFoundError = require.main.require('./sys/errors/NotFoundError');

module.exports = class Query {
	constructor(model) {
		this._model = model;
		this._table = model._table;
		this._queries = [];
		this._sort = null;
		this._limit = 0;
	}
	
	where(field, operator, value) {
		if (value === undefined) {
			value = operator;
			operator = '=';
		}
		
		switch (operator) {
		case '=':
			this._queries.push({
				[field]: {
					$eq: value
				}
			});
			break;
		case '>':
			this._queries.push({
				[field]: {
					$gt: value
				}
			});
			break;
		case '<':
			this._queries.push({
				[field]: {
					$lt: value
				}
			});
			break;
		case 'in':
			this._queries.push({
				[field]: {
					$in: value // value should be an array in this case //
				}
			});
			break;
		case '!=':
			this._queries.push({
				[field]: (
					value !== null ?
						{
							$ne: value
						} : {
							$exists: true
						}
				)
			});
			break;
		}
		
		return this;
	}
	
	orderBy(sort) {
		this._sort = sort;
		
		return this;
	}
	
	limit(n) {
		this._limit = n;
		
		return this;
	}
	
	execute(req) {
		const queries = {};
		
		for (let i = 0; i < this._queries.length; i++) {
			for (const prop in this._queries[i])
				queries[prop] = Object.assign(queries[prop] || {}, this._queries[i][prop]);
		}
		
		let sort = this._sort;
		if (sort !== null) {
			if (sort.startsWith('-'))
				sort = {[sort.substr(1)]: -1};
			else
				sort = {[sort]: 1};
		}
		
		return req.database.collection(this._table).find(queries).limit(this._limit).sort(sort).toArray()
			.then(items => {
				return ModelCollection.fromDatabase(this._model, items);
			});
	}
	
	get(req) {
		return this.execute(req)
			.then(collection => {
				return collection.get();
			});
	}
	
	count(req) {
		return this.execute(req)
			.then(collection => {
				return collection.count();
			});
	}
	
	empty(req) {
		return this.execute(req)
			.then(collection => {
				return collection.count() === 0;
			});
	}
	
	first(req) {
		return this.execute(req)
			.then(collection => {
				if (collection.empty())
					throw new NotFoundError();
				
				return collection.first();
			});
	}
	
	last(req) {
		return this.execute(req)
			.then(collection => {
				if (collection.empty())
					throw new NotFoundError();
				
				return collection.last();
			});
	}
};