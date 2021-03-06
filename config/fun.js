var query = require('./node-mysql.js');
var crypto = require('crypto');
var secret = require('./env.js').secret;
var tool = require('./tool.js');
//查询分类函数
function selectClassify(callback) {
	var c_sql = 'select a.*,b.cover as img from th_classify a left join th_classify_first b on b.id=a.parent_id where a.status=1 order by a.article_num desc limit 30';
	query(c_sql,function(err, vals, fields){
		if(err) {
			callback('err');
		}else {
			vals.map((item) => {
				return item.class_name = 'colorful_' + tool.random(1)
			})
			var m = new Date().getMonth() + 1;
			var month = tool.returnMonth(m);
			let commend = vals.slice(0,6);
			var obj = {
				commend: commend,
				list: vals,
				month: month
			}
			callback(null,obj);
		}
	})
}
//首页文章列表函数
function indexList(callback,offset) {
	var c_sql = "select a.id,a.article_sign,a.title,a.cover,a.abstract,a.point_count,a.comment_count,a.attention_count,b.nick from th_article a left join th_user b on b.id=a.user_id where a.status=1 order by a.create_time desc limit "+offset+", 20";
	query(c_sql,function(err, vals, fields){
		if(err) {
			callback('err',1);
		}else {
			callback(null,vals);
		}
	})
}
//加密函数
function encodeStr(str) {
	//var encode = JSON.stringify(str);
	var cipher = crypto.createCipher('aes192',secret);
	var enc = cipher.update(str,'utf8','hex');
	enc += cipher.final('hex');
	return enc;
}
//解密函数
function decodeStr(str) {
	var decipher = crypto.createDecipher('aes192', secret);
	var dec = decipher.update(str, 'hex', 'utf8');
	dec += decipher.final('utf8');
	return dec;
}
//img正则替换+懒加载
function imgReplace(str) {
    var reg = /<img\b.*?(?:\>|\/>)/gi,
        regSrc = /\bsrc\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i;
    return str.replace(reg,function(match,pos,orginText){
    	var src1 = match.match(regSrc)[0];
    	var src2 = src1.slice(5,src1.length-1);
    	var img = '<img class="lazy" data-original="'+src2+'" src="'+src2+'">';
    	return '<div style="width:700px;margin-left:-40px;margin-bottom:0;">'+img+'</div>';
    })
}
//async await 中间函数
function to(promise) {
	return promise.then(data => {
	   return [null, data];
	})
	.catch(err => [err]);
 }
 //查询用户基本信息
function selectUserBaseMsg(id) {
	return new Promise((resolve,reject)=>{
		var sql = "select * from th_user where id=?";
		query(sql,[id],function(err,vals,fields){
			if(err) {
				reject(err);
			}else {
				resolve(vals);
			}
		})
	})
}
module.exports = {
	to: to,
	selectClassify: selectClassify,
	indexList: indexList,
	encodeStr: encodeStr,
	decodeStr: decodeStr,
	imgReplace: imgReplace,
	selectUserBaseMsg: selectUserBaseMsg
}
