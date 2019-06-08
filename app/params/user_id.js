module.exports = function (req, res, next, user_id) {
	if (user_id === 'me' && req.user)
		req.params.user_id = req.user.id;
	
	return next();
};