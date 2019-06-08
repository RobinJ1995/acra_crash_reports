const Model = require.main.require('./sys/database/models/Model');
const Field = require.main.require('./sys/database/fields/Field');

class Project extends Model {
}

Project._table = 'project';
Project._fields = {
	id: new Field().uuid().primaryKey(),
	name: new Field().string().required().unique()
};

module.exports = Project;