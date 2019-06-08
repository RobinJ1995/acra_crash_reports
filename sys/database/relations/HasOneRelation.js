var Relation = require.main.require('./sys/database/relations/Relation');

module.exports = class HasOneRelation extends Relation {
	constructor(model1, model2Name, local, foreign, methodName) {
		super();
		
		if (typeof model1 == 'string') {
			this.model1Name = model1;
			this.model1 = require.main.require('./app/models/' + model1);
		}
		else {
			this.model1Name = model1.name;
			this.model1 = model1;
		}
		this.model2Name = model2Name;
		
		this.local = local;
		this.foreign = foreign || 'id';
		this.methodName = methodName || model2Name;
		
		this.addMethods();
	}
	
	addMethods() {
		var self = this;
		
		this.model1.prototype[this.methodName] = function (req) {
			// self is the relation // this is the model instance //
			
			self.loadModel2();
			
			if (self.local == null)
				self.figureOutLocalKey();
			
			return self.model2.where(self.foreign, this[self.local]).execute(req)
				.then(collection => {
					return collection.first();
				});
		};
	}
	
	figureOutLocalKey() {
		this.loadModel2();
		
		var model1Fields = this.model1.fieldNames();
		
		for (var i = 0; i < model1Fields.length; i++) {
			var possibilities = [this.model2Name + 'id', this.model2Name + '_id'];
			
			for (var j = 0; j < possibilities.length; j++) {
				if (possibilities[j].toLocaleLowerCase() == model1Fields[i].toLowerCase()) {
					this.local = model1Fields[i];
					
					return model1Fields[i];
				}
			}
		}
	}
	
	loadModel2() {
		if (this.model2 == null)
			this.model2 = require.main.require('./app/models/' + this.model2Name);
	}
};