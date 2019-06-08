var DatabaseFactory = require.main.require('./sys/database/DatabaseFactory');

module.exports = (req, res, next) => {
	DatabaseFactory.getDatabase(req.app.config)
		.then(database => {
			req.database = database;
			
			return next();
		});
};