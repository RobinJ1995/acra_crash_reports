var Controller = require.main.require('./sys/http/controllers/Controller');
var Validator = require('input-field-validator');
var Crash = require.main.require('./app/models/Crash');
var Project = require.main.require('./app/models/Project');
var Promise = require('bluebird');

module.exports = class CrashController extends Controller {
	static index(req, res) {
		return Crash.all(req, true)
			.then(crashes => res.ok(crashes.strip()))
			.catch(error => res.error(error));
	}

	static create(req, res) {
		console.log('Incoming crash report', req.body);

		const projectName = req.auth.user;

		Project.where('name', projectName).execute(req)
			.then(projects => {
				if (projects.empty()) {
					return new Project({
						name: projectName
					}).save(req);
				}

				return projects.first();
			}).then(project => new Crash({
					data: req.body,
					project_id: project.id
				}).save(req))
			.then(crash => res.created(crash))
			.catch(err => res.error(err));
	}
};
