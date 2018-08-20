module.exports = function(app) {
	var home = require('../models/template/home.js');
	var write = require('../models/template/write.js');
	var login = require('../models/template/login.js');
	var details = require('../models/template/details.js');
	var classes = require('../models/template/classes.js');
	var user = require('../models/template/user.js');
	var setting = require('../models/template/setting.js');
	app.use('/',home);
	app.use('/',write);
	app.use('/',login);
	app.use('/',details);
	app.use('/',classes);
	app.use('/',user);
	app.use('/setting',setting);
}