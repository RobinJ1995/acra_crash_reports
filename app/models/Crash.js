const Model = require.main.require('./sys/database/models/Model');
const Field = require.main.require('./sys/database/fields/Field');

const EMPTY_VALUES = Object.freeze(['', '""', "''", '{}', '[]', null, undefined]);

class Crash extends Model {
}

Crash._table = 'crash';
Crash._fields = {
	id: new Field().uuid().primaryKey(),
	data: new Field().object().required(),
	project_id: new Field().uuid().required().exists('Project')
};
Crash.hasOne('Project');
Crash.presave = [
	function() {
		return !EMPTY_VALUES.includes(JSON.stringify(this.data));
	},
];

module.exports = Crash;