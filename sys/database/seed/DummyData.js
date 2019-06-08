var Promise = require('bluebird');
var Filesystem = require('fs');
var Path = require('path');
var JsonImporter = require.main.require('./sys/database/seed/JsonImporter');

module.exports = class DummyData {
	constructor(database, dir) {
		this.database = database;
		this.dir = Path.dirname(require.main.filename) + '/' + dir;
	}
	
	getFiles() {
		var excluded = [];
		
		return Promise.promisify(Filesystem.readdir)(this.dir)
			.then(files => {
				var collections = {};
				
				files.forEach(file => {
					var name = file.substring(0, file.length - (file.endsWith('.js') ? 3 : 5));
					
					if (excluded.indexOf(file) == -1)
						collections[name] = this.dir + '/' + file;
				});
				
				this.collections = collections;
				
				return this;
			});
	}
	
	import() {
		var promises = [];
		
		for (var name in this.collections) {
			var importer = new JsonImporter(this.database);
			
			promises.push(importer.open(this.collections[name]).import(name));
		}
		
		return Promise.all(promises);
	}
};