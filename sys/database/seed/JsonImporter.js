module.exports = class JsonImporter {
	constructor(database) {
		this.database = database;
	}
	
	open(file) {
		this.data = require.main.require(file);
		
		return this;
	}
	
	read(data) {
		this.data = data;
		
		return this;
	}
	
	import(table) {
		var collection = this.database.collection(table);
		
		return collection.insertMany(this.data);
	}
};