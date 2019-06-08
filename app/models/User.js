const Model = require.main.require('./sys/database/models/Model');
const Field = require.main.require('./sys/database/fields/Field');
const Credentials = require('credentials');

class User extends Model {
	verifyPassword(password) {
		return Credentials().verify(this.hash, password);
	}
	
	setPassword(password) {
		return Credentials().hash(password)
			.then(hash => {
				this.hash = hash;
			});
	}
}

User._table = 'user';
User._fields = {
	id: new Field().uuid().primaryKey(),
	username: new Field().string().required().unique(),
	hash: new Field().crypt().hidden().required(),
	first_name: new Field().string(),
	last_name: new Field().string(),
	preferences: new Field().object().hidden(),
	admin: new Field().boolean(),
	email: new Field().string().required().unique().hidden(),
};

module.exports = User;