var express = require('express')
var router = express.Router()
var DB = require('./class/db')
var sync = require('sync_back').run
var debug = require('debug')('fullfan:interface')
var hmacsha1 = require('hmacsha1');
var request = require('request');
var crypto = require('crypto')
  // 获取 RequestToken
router.get('/getRequestToken', function (req, res, next) {
  sync(function* (api) {
    var common = {
      urlEncode: function (toEncode) {
        if (toEncode == null || toEncode == "") return ""
        else {
          var result = encodeURIComponent(toEncode);
          // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
          return result.replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
        }
      }
    };
    var consumer_key = (yield DB.read('SELECT * FROM variable WHERE key = "appkey"', api.next))[0].value;
    var consumer_secret = (yield DB.read('SELECT * FROM variable WHERE key = "appsecret"', api.next))[0].value;
    debug(consumer_key)
    var request_token_url = 'http://fanfou.com/oauth/request_token';
    var timestamp = parseInt(new Date().getTime() / 1000);
    var oauth_nonce = crypto.createHash('md5').update('' + Math.floor(Math.random() * 1000) + timestamp).digest('hex');
    var paramArr = [
      'oauth_consumer_key=' + consumer_key,
      'oauth_signature_method=' + 'HMAC-SHA1',
      'oauth_timestamp=' + timestamp,
      'oauth_nonce=' + oauth_nonce
    ];
    var baseString = ('GET&' + common.urlEncode(request_token_url) + '&' + common.urlEncode(paramArr.sort().join('&')));
    var key = common.urlEncode(consumer_secret) + '&';
    var oauth_signature = crypto.createHmac('sha1', key).update(baseString).digest('base64');
    var url = 'http://fanfou.com/oauth/request_token?oauth_signature_method=HMAC-SHA1&oauth_consumer_key=' + consumer_key + '&oauth_timestamp=' + timestamp + "&oauth_nonce=" + oauth_nonce + "&oauth_signature=" + common.urlEncode(oauth_signature);
    request.get({
      url: url
    }, function (e, r, b) {
      backSuccess(res, b)
    });
  })
})
module.exports = router

function backFail(res, httpCode, errCode, errMes) {
  var r = {}
  r.success = false
  r.code = errCode
  r.data = errMes
  res.status(httpCode)
  res.send(r)
}

function backSuccess(res, data) {
  var r = {}
  r.success = true
  r.code = 0
  if (data != null) r.data = data
  res.status(200)
  res.send(r)
}

function isLogin(req) {
  if (req.session.uid != null) return true
  return false
}

function checkLogin(req, res) {
  if (isLogin(req)) return false
  backFail(res, 401, -1, '未登录')
  return true
}

function checkArg(req, res, argArr) {
  var post = req.body
  for (var i of argArr) {
    if (post[i] == null) {
      backFail(res, 400, -1, '缺少参数:' + i)
      return true
    }
  }
  return false
}