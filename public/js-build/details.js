new Vue({
    delimiters: ['${', '}'],
    el: '#detailsPage',
    data: {
        article_id: '',
        classify_id: '',
		author_id: '',
        reviewFlag: false,
        review_content: '',
        comment_list: [],
        comment_page: 1,
        comment_count: 0,
        comment_show: 2,
        recommendList: []
    },
    created: function () {

    },
    mounted: function () {
        this.init();
        this.delayload();
    },
    filters: {
        date: dateYmdHis
    },
    methods: {
        //初始化
        init: function () {
            var _this = this;
            this.article_id = $('#article_id').val();
            this.classify_id = $('#classify_id').val();
			this.author_id = $('#author_id').val();
            $('body').on('click', function () {
                $('.receipt_code').hide(500);
            })
            //点击喜欢按钮
            $('.like-group').on('click', function () {
                if (getCookie('userInfo')) {
                    if ($(this).hasClass('unlike')) { //不喜欢
                        $(this).removeClass('unlike').addClass('islike');
                        _this.likefun(1);
                    } else { //喜欢
                        $(this).removeClass('islike').addClass('unlike');
                        _this.likefun(0);
                    }
                } else {
                    goLogin(_this, '喜欢这篇文章需要登录，现在去登录？');
                }
            })
        },
        //延迟加载评论
        delayload: function () {
            var _this = this;
            var load_flag = 1;
            $(window).scroll(function () {
                var mTop = $('#comments')[0].offsetTop;
                var sTop = $(window).scrollTop();
                if (mTop - sTop < 600 && load_flag == 1) {
                    load_flag = 0;
                    _this.getComment_list();
                    _this.getrecommend();
                }
            })
        },
        //赞赏按钮
        rewardswitch: function () {
            $('.receipt_code').show(500);
        },
        //喜欢按钮
        likefun: function (type) {
            var _this = this;
            $.ajax({
                url: '/api/islike',
                type: 'get',
                dataType: 'json',
                data: {
                    islike: type,
                    article_id: this.article_id,
					author_id: this.author_id
                },
                success: function (res) {
                    if (res.code != 200) {
                        _this.$message.warning(res.body);
                    }
                },
                error: function () {
                    _this.$message.error('当前网络不佳，请稍后重试');
                }
            })
        },
        //发表评论
        review_send: function () {
            var _this = this;
            //发送评论
            if (!this.review_content.length) {
                this.$message.warning('回复内容不能为空');
                return false;
            }
            $.ajax({
                url: '/api/publish/comment',
                type: "post",
                dataType: 'json',
                data: {
                    article_id: this.article_id,
                    content: this.review_content
                },
                success: function (res) {
                    if (res.code != 200) {
                        _this.$message.warning(res.body);
                    } else {
                        _this.review_content = '';
                        _this.reviewFlag = false;
                        _this.$message.success('评论成功');
                        _this.comment_page = 1;
                        _this.getComment_list();
                    }
                },
                error: function () {
                    _this.$message.error('当前网络不佳，请稍后重试');
                }
            })
        },
        pageChange: function (current) {
            this.comment_page = current;
            this.getComment_list();
        },
        //获取评论列表
        getComment_list: function () {
            var _this = this;
            $.ajax({
                url: '/api/commentList',
                type: 'get',
                data: {
                    article_id: this.article_id,
                    page: this.comment_page
                },
                dataType: 'json',
                success: function (res) {
                    if (res.code == 200) {
                        var arr = [];
                        if (res.body.list.length != 0) {
                            arr = res.body.list;
                            arr.forEach(function (current, index) {
                                current.comment_reply = {
                                    flag: false,
                                    content: ''
                                }
                            })
                        }
                        _this.comment_list = arr;
                        _this.comment_count = res.body.count;
                        if (res.body.count == 0) { //无数据
                            _this.comment_show = 0;
                        } else {
                            _this.comment_show = 1;
                        }
                    } else {
                        _this.$message.warning(res.body);
                    }
                },
                error: function () {

                }
            })
        },
        //评论点赞
        pointPraise: function (type, index) {
            var _this = this;
            if (!getCookie('userInfo')) {
                goLogin(_this, '给这条评论点赞需要登录，现在去登录？');
                return false;
            }
            if (type == 1) { //点赞
                _this.comment_list[index].isPraise = true;
                _this.comment_list[index].praise_count++;
            } else { //取消赞
                _this.comment_list[index].isPraise = false;
                _this.comment_list[index].praise_count--;
            }

            $.ajax({
                url: '/api/pointPraise',
                type: 'get',
                dataType: 'json',
                data: {
                    type: type,
                    comment_id: _this.comment_list[index].id
                },
                success: function (res) {
                    if (res.code != 200) {
                        _this.$message.warning('操作失败，请稍后重试');
                        if (type == 1) {
                            _this.comment_list[index].isPraise = false;
                            _this.comment_list[index].praise_count--;
                        } else {
                            _this.comment_list[index].isPraise = true;
                            _this.comment_list[index].praise_count++;
                        }
                    }
                },
                error: function () {
                    _this.$message.error('当前网络不佳，请稍后重试');
                    if (type == 1) {
                        _this.comment_list[index].isPraise = false;
                        _this.comment_list[index].praise_count--;
                    } else {
                        _this.comment_list[index].isPraise = true;
                        _this.comment_list[index].praise_count++;
                    }
                }
            })
        },
        //点击回复按钮
        replyctrl: function (type, index) {
            var _this = this;
            if (!getCookie('userInfo')) {
                goLogin(_this, '回复这条评论需要登录，现在去登录？');
                return false;
            }
            var current = _this.comment_list[index];
            current.comment_reply.flag = 1;
            if (type == 1) { //回复的评论
                var reply_id = current.user_id;
            } else { //回复的回复
                var reply_id = current.replay_list[index].user_id;
            }
            current.reply_person_id = reply_id;
        },
        //发表回复
        reply_send: function (index) {
            var _this = this;
            if (!getCookie('userInfo')) {
                goLogin(_this, '回复这条评论需要登录，现在去登录？');
                return false;
            }
            var current = _this.comment_list[index];
            if (!current.comment_reply.content.length) {
                _this.$message.warning('回复内容不能为空');
                return false;
            }
            $.ajax({
                url: '/api/publish/reply',
                type: 'post',
                dataType: 'json',
                data: {
                    content: current.comment_reply.content,
                    comment_id: current.id,
                    reply_id: current.reply_person_id
                },
                success: function (res) {
                    if (res.code == 200) {
                        current.reply_list.push(res.body);
                        current.comment_reply.content = '';
                        current.comment_reply.flag = false;
                        _this.$message.success('回复成功');
                    } else {
                        _this.$message.warning(res.body);
                    }
                },
                error: function () {
                    _this.$message.error('当前网络不佳，请稍后重试');
                }
            })
        },
        //取消回复
        cancel_reply: function (index) {
            var current = this.comment_list[index];
            current.comment_reply.flag = false;
        },
        //推荐文章列表
        getrecommend: function () {
            var _this = this;
            $.ajax({
                url: '/api/article/recommendList',
                type: 'get',
                dataType: 'json',
                data: {
                    article_id: this.article_id,
                    classify_id: this.classify_id
                },
                success: function (res) {
                    if (res.code == 200) {
                        _this.recommendList = res.body;
                    }
                }
            })
        }
    }
})
