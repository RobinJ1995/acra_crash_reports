module.exports = (error, req, res, next) => {
	console.error(error);
	
	return res.error(error);
};
