var Busboy = require('busboy');
var fs = require('fs');
var fse = require('fs-extra');
var os = require('os');
var path = require('path');
var snowflake = require('node-snowflake').Snowflake;
var downloadUrl;
/**
 * ueditor 请求方法
 * @param  {url} downUrl [ueditor 下载请求处理]
 * @param  {[type]} handel  [下载请求触发器-中间件]
 */
var ueditor = function(downUrl, handel) {
  downloadUrl = downUrl + '/';
  return function(req, res, next) {
    var _respond = respond("", handel);
    _respond(req, res, next);
  };
};
var respond = function(static_url, callback) {
  return function(req, res, next) {
    if (req.query.action === 'config') {
      callback(req, res, next);
      return;
    } else if (req.query.action === 'listimage') {
      res.ue_list = function(list_dir) {
        var str = '';
        var i = 0;
        var list = [];
        fs.readdir(static_url + list_dir, function(err, files) {
          if (err) throw err;

          var total = files.length;
          files.forEach(function(file) {

            var filetype = 'jpg,png,gif,ico,bmp';
            var tmplist = file.split('.');
            var _filetype = tmplist[tmplist.length - 1];
            if (filetype.indexOf(_filetype.toLowerCase()) >= 0) {
              var temp = {};
              //if (list_dir === '/') {
              //  temp.url = list_dir + file;
              //} else {
              //  temp.url = list_dir + "/" + file;
              //}
              temp.url = downloadUrl+file;
              list[i] = (temp);
            } else {}
            i++;
            // send file name string when all files was processed
            if (i === total) {
              res.json({
                "state": "SUCCESS",
                "list": list,
                "start": 1,
                "total": total
              });
            }
          });
        });
      };
      callback(req, res, next);

    } else if (req.query.action === 'uploadimage') {

      var busboy = new Busboy({
        headers: req.headers
      });

      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        req.ueditor = {};
        req.ueditor.fieldname = fieldname;
        req.ueditor.file = file;
        req.ueditor.filename = filename;
        req.ueditor.encoding = encoding;
        req.ueditor.mimetype = mimetype;

        res.ue_up = function(img_url) {
          var tmpdir = path.join(os.tmpDir(), path.basename(filename));
          var name = snowflake.nextId() + path.extname(tmpdir);
          var dest = path.join(static_url, img_url, name);

          file.pipe(fs.createWriteStream(tmpdir));
          fse.move(tmpdir, dest, function(err) {
            if (err) throw err;
            var _fixUrl = '/download/images/ueditor/'+name;
            res.json({
              'url':_fixUrl ,
              'title': req.body.pictitle,
              'original': filename,
              'state': 'SUCCESS'
            });
          });
        };
        callback(req, res, next);
      });
      req.pipe(busboy);
    } else {
      callback(req, res, next);
    }
    return;
  };
};
module.exports = ueditor;