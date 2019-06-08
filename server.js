var Express = require('express');
var Logops = require('logops');
var ExpressLogging = require('express-logging');
var BodyParser = require('body-parser');
var CORSMiddleware = require.main.require('./app/middleware/CORSMiddleware');

var app = Express();
app.config = require.main.require('./app/config')();

app.use(ExpressLogging(Logops));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true}));
app.use(require.main.require('./sys/http/middleware/response'));
app.use(require.main.require('./sys/http/middleware/database'));
app.use(require.main.require('./sys/http/middleware/AuthenticationMiddleware').try);

app.param('user_id', require.main.require('./app/params/user_id'));
app.use(CORSMiddleware.production);
require.main.require('./app/routes')(app);

app.use(require.main.require('./sys/http/middleware/error'));

app.listen(
	app.config.port,
	() => console.log('Server listening on port ' + app.config.port)
);
