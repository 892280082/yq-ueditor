# yq-ueditor
```js
    //配置ueditor编辑器后台 如果出现下载错误，/download/images/ueditor" ->下载文件名前缀
    app.use("/plugin/ueditor/ueditor", ueditor("/download/images/ueditor", function(req, res, next) {
        // ueditor 发起上传图片请求
        if (req.query.action === 'uploadimage') {
            var foo = req.ueditor;
            var imgname = req.ueditor.filename;
            var img_url =  app.get('upload_file') + '/images/ueditor';
            //你只要输入要保存的地址 。保存操作交给ueditor来做
            res.ue_up(img_url);
        }
        //  客户端发起图片列表请求
        else if (req.query.action === 'listimage') {
            var dir_url = app.get('upload_file') + '/images/ueditor';
            // 客户端会列出 dir_url 目录下的所有图片
            res.ue_list(dir_url);
        }
        // 客户端发起其它请求
        else {
            res.setHeader('Content-Type', 'application/json');
            res.redirect('/back/angular/vendor/modules/angular-ueditor/nodejs/config.json');
        }
    }));

```