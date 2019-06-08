const ExpressBasicAuth = require('express-basic-auth');
const AuthenticationMiddleware = require.main.require('./sys/http/middleware/AuthenticationMiddleware');
const AuthenticationController = require.main.require('./app/controllers/AuthenticationController');
const UserController = require.main.require('./app/controllers/UserController');
const CrashController = require.main.require('./app/controllers/CrashController');
const MaintenanceController = require.main.require('./app/controllers/MaintenanceController');

module.exports = (app) => {
	app.post('/authenticate', AuthenticationController.authenticate);

	app.get('/user', UserController.index);
	app.get('/user/:user_id', UserController.show);

	//app.post('/article', AuthenticationMiddleware.user, ArticleController.create);
	app.post('/crash', ExpressBasicAuth({
		users: app.config.credentials.users,
		challenge: true
	}), CrashController.create);

	app.get ('/maintenance/data/import', MaintenanceController.importDummyData);
	app.get ('/maintenance/data/dump', MaintenanceController.dumpDb);
	app.get ('/maintenance/data/dump/users', MaintenanceController.users);
};
