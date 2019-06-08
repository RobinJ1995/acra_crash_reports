var Controller = require.main.require('./sys/http/controllers/Controller');
var DummyData = require.main.require('./sys/database/seed/DummyData');
var User = require.main.require('./app/models/User');
var Promise = require('bluebird');

module.exports = class MaintenanceController extends Controller {
	static importDummyData(req, res) {
		var seeder = new DummyData(req.database, 'dummyData');
		
		return seeder.getFiles()
			.then(seeder => seeder.import())
			.then(r => res.ok(r))
			.catch(error => res.error(error));
	}
	
	static dumpDb(req, res) {
		var _collections = [];
		
		req.database.listCollections({}).toArray()
			.then(collections => {
				_collections = collections;
				var promises = [];
				
				for (var key in collections) {
					var collection = req.database.collection(collections[key].name);
					
					promises.push(collection.find({}).toArray());
				}
				
				return Promise.all(promises);
			})
			.then(r => {
				const data = {};
				
				for (var i = 0; i < _collections.length; i++)
					data[_collections[i].name] = r[i];
				
				return res.ok(data);
			})
			.catch(error => res.error(error));
	}
	
	static users(req, res) {
		let _users = [];
		
		User.all(req)
			.then(users => {
				_users = users;
					
				const promises = [];
					
				for (var i = 0; i < users.length; i++)
					promises.push(users[i].UserInterest(req));
					
				return Promise.all(promises);
			})
			.then(userInterests => {
				for (let i = 0; i < userInterests.length; i++)
					_users[i].interests = userInterests[i];
				
				return res.ok(_users);
			})
			.catch(error => res.error(error));
	}
};
