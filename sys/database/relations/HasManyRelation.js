const Relation = require.main.require('./sys/database/relations/Relation');

module.exports = class HasManyRelation extends Relation {
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
		
		this.local = local || 'id';
		this.foreign = foreign;
		this.methodName = methodName || model2Name;
		
		this.addMethods();
	}
	
	addMethods() {
		const self = this;
		
		this.model1.prototype[this.methodName] = function (req, returnModelCollection) {
			// self is the relation // this is the model instance //
			
			self.loadModel2();
			
			if (self.foreign == null)
				self.figureOutForeignKey();
			
			return self.model2.where(self.foreign, this[self.local]).execute(req).then(
				collection => {
					if (returnModelCollection) {
						return collection;
					}
				
					return collection.get();
				}
			);
		};
	}
	
	figureOutForeignKey() {
		this.loadModel2();
		
		const model2Fields = this.model2.fieldNames();
		
		for (let i = 0; i < model2Fields.length; i++) {
			const possibilities = [this.model1Name + 'id', this.model1Name + '_id'];
			
			for (let j = 0; j < possibilities.length; j++) {
				if (possibilities[j].toLocaleLowerCase() == model2Fields[i].toLowerCase()) {
					this.foreign = model2Fields[i];
					
					return model2Fields[i];
				}
			}
		}
	}
	
	loadModel2() {
		if (this.model2 == null)
			this.model2 = require.main.require('./app/models/' + this.model2Name);
	}
};