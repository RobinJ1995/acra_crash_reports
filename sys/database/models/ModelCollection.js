module.exports = class ModelCollection {
	constructor(items) {
		this._items = items;
	}
	
	count() {
		return this._items.length;
	}
	
	empty() {
		return this.count() === 0;
	}
	
	first() {
		if (this.count() > 0)
			return this._items[0];
		
		throw new Error('ModelCollection contains no items');
	}
	
	last() {
		if (this.count() > 0)
			return this._items[this.count() - 1];
		
		throw new Error('ModelCollection contains no items');
	}
	
	get(i) {
		if (i == null)
			return this._items || [];
		else
			return this._items[i];
	}
	
	orderBy(property, descending = false) {
		return this._items.sort((a, b) =>
			(descending ? b[property] - a[property] : a[property] - b[property]));
	}
	
	where(property, operator, value) {
		if (value === undefined) {
			value = operator;
			operator = '==';
		}
		
		return this._items.filter(item => {
			switch (operator) {
			case '==':
				return item[property] == value;
			case '===':
				return item[property] === value;
			case '!=':
				return item[property] != value;
			case '!==':
				return item[property] !== value;
			case '>':
				return item[property] > value;
			case '>=':
				return item[property] >= value;
			case '<':
				return item[property] < value;
			case '<=':
				return item[property] <= value;
			}
		});
	}
	
	strip() {
		const stripped = [];
		
		for (let i = 0; i < this._items.length; i++)
			stripped[i] = this._items[i].strip();
		
		return stripped;
	}
	
	static fromDatabase(type, data) {
		const items = [];
		
		for (let i = 0; i < data.length; i++) {
			const item = type.fromDatabase(data[i]);
			
			items.push(item);
		}
		
		return new ModelCollection(items);
	}
};