module.exports = class AuthenticationMiddleware {
	static localhost4200(req, res, next) {
		res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
		res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
		
		next();
	}
	
	static production(req, res, next) {
		res.header('Access-Control-Allow-Origin', 'https://acra.robinj.be');
		res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
		
		next();
	}
};
