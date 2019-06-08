module.exports = (app) => {
	return {
		consoleLog: function (data) {
			return console.log(data);
		},
		t: function () {
			var translation = app.translations;
			for (var i = 0; i < arguments.length; i++) {
				var name = arguments[i];
				
				if (!(typeof name == 'string' || name instanceof String))
					break;
				
				var parts = name.split('.');
				for (var j = 0; j < parts.length; j++)
					translation = translation[parts[j]];
			}
			
			return translation;
		}
	};
};