var MongoClient = require('mongodb').MongoClient;

module.exports = class DatabaseFactory {
	static getDatabase(config) {
		if (this.connection == null) {
			const auth = config.db.username ? `${config.db.username}:${config.db.password}@` : '';
			const connectionString = `mongodb://${auth}${config.db.host}:${config.db.port}/${config.db.name}${auth ? '?authMechanism=DEFAULT&authSource=admin' : ''}`;

			return MongoClient.connect(connectionString)
			.then(connection => {
				console.log('Database connection established.');
				
				this.connection = connection;
				
				return this.connection;
			});
		}
		
		return Promise.resolve(this.connection);
	}
};