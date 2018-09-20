var express = require('express');
var router = express.Router();
var query = require('../../config/node-mysql.js');
var async = require('async');
var fun = require('../../config/fun.js');

/* GET classes page. */
router.get('/c/:id', function (req, res, next) {
	delete require.cache[require.resolve('../../config/env.js')];
	var env = require('../../config/env.js');
	var classify_id = req.params.id;
	env.header['userInfo'] = req.userInfo;
	
	
	async.parallel([
		function(callback) {
			var s_sql = "select * from th_classify where id='"+classify_id+"' and status=1";
			query(s_sql,function(err, vals, fields){
				if(err) {
					callback('err');
				}else {
					callback(null,vals);
				}
			})
		},
		function(callback) {
			fun.selectClassify(callback);
		}
	],function(err,result){
		if(err) {
			res.render('error/error');
		}else {
			env.meta['title'] = result[0][0].value + ' - 桃花源';
			res.render('classes', {
				meta: env.meta,
				header: env.header,
				classify: result[1],
				classify_id: classify_id,
				class_msg: result[0][0]
			});
		}
	})
});

module.exports = router;