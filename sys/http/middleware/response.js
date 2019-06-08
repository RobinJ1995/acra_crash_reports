var Response = require.main.require('./sys/http/Response');

/*
 * Add the methods in the Response class to Express' Response object
 */

module.exports = (req, res, next) => {
	Object.getOwnPropertyNames(Response.prototype)
		.forEach(method => {
			if (!res[method] && method != 'constructor')
				res[method] = Response.prototype[method];
		});
	
	res.responseFormat = req.app.config.format;
	
	return next();
};