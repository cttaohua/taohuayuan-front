var mysql = require('mysql');

var pool = mysql.createPool({
    host: '47.94.227.198',
    user: 'root',
    password: 'Lh456123',
    database: 'taohua'
})
// var pool = mysql.createPool({
// 	host: 'localhost',
// 	user: 'root',
// 	password: '123456',
// 	database: 'taohua'
// })

var query = function (sql, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, function (qerr, vals, fields) {
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr, vals, fields);
            });
        }
    });
};

module.exports = query;
