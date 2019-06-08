module.exports = (req, res, next) => {
	req.app.locals.req = req;
	
	return next();
};