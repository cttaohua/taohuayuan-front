new Vue({
	el: '#loginPage',
	data: {
		cut_flag: 1,
		login_phone: '',
		login_password: '',
		register_name: '',
		register_phone: '',
		register_password: '',
		originalUrl: ''
	},
	created: function () {

	},
	mounted: function () {
		this.init()
	},
	methods: {
		init: function () {
			this.originalUrl = $('#originalUrl').val()
		},
		cut: function (flag) {
			this.cut_flag = flag;
		},
		thirdParty: function (type) {
			let _this = this;
			switch (type) {
				case 1:
					_this.weibo_login();
					break;
				case 2:
					_this.weixin_login();
					break;
				default:
					_this.weixin_login();
			}
		},
		register: function () {
			if (this.register_name.length < 2) {
				this.$message.warning('昵称长度必须大于2位');
				return false;
			}
			if (!(/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(this.register_phone))) {
				this.$message.warning('请输入正确的手机号');
				return false;
			}
			if (this.register_password.length < 6) {
				this.$message.warning('密码长度必须大于6位');
				return false;
			}
			var _this = this;
			$.ajax({
				url: '/api/register',
				type: 'post',
				data: {
					user_name: this.register_name,
					user_phone: this.register_phone,
					user_password: this.register_password
				},
				dataType: 'json',
				success: function (res) {
					var code = res.code;
					if (code == 200) {
						_this.login_phone = _this.register_phone;
						_this.login_password = _this.register_password;
						_this.login();
					} else {
						_this.$message.warning(res.body);
					}
				},
				error: function () {
					_this.$message.error('当前网络不佳，请稍后重试');
				}
			})
		},
		login: function () {
			var _this = this;
			$.ajax({
				url: '/api/login',
				type: 'post',
				data: {
					user_phone: this.login_phone,
					user_password: this.login_password
				},
				dataType: 'json',
				success: function (res) {
					if (res.code == 200) {
						// var href = window.localStorage.getItem('loginHref');
						if (_this.originalUrl != '') {
							window.location.href = _this.originalUrl;
						} else {
							window.location.href = '/';
						}
						// window.localStorage.setItem('loginHref', '');
					} else {
						if (res.code == 1) {
							_this.cut_flag = 2;
						}
						_this.$message.warning(res.body);
					}
				},
				error: function () {
					_this.$message.error('当前网络不佳，请稍后重试');
				}
			})
		},
		weibo_login: function () {
			this.$message.warning('暂不支持微博登录');
		},
		weixin_login: function () {
			this.$message.warning('暂不支持微信登录');
		}
	}
})
