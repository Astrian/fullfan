var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
var CryptoJS = require("crypto-js");
var queryString = require('query-string');
var sync = require('sync_back').run
var DB = require('./class/db')
var debug = require('debug')('fullfan: interface')
var appkey
var appsecret

function variable() {
  sync(function* (api) {
    appkey = (yield DB.read('SELECT * FROM variable WHERE key = "appkey"', api.next))[0].value
    appsecret = (yield DB.read('SELECT * FROM variable WHERE key = "appsecret"', api.next))[0].value
  })
}
variable()

var oauth_token_secret = ''
router.get('/getRequestToken', function (req, res, next) {
    var base_url = 'http://fanfou.com/oauth/request_token'

    var arg = [
        'oauth_consumer_key=' + appkey,
        'oauth_signature_method=HMAC-SHA1',
        'oauth_timestamp=' + parseInt(new Date().getTime() / 1000),
        'oauth_nonce=' + crypto.createHash('md5').update('' + Math.floor(Math.random() * 1000)).digest('hex')
    ]

    var baseString = 'GET' + '&' + encodeURIComponent(base_url) + '&' + encodeURIComponent(arg.sort().join('&'))
    var key = encodeURIComponent(appsecret) + '&'
    var sig = signture(baseString, key)
    arg.push('oauth_signature=' + sig)
    var url = base_url.replace('http://', 'https://') + '?' + arg.join('&')

    debug('baseString', baseString)
    //console.log('key', key)
    //console.log('sig', sig)
    debug('url', url)

    request.get(url, function (err, data) {
        if (err)
            return backFail(res, err)

        var result = queryString.parse(data.body)
        //oauth_token_secret = result.oauth_token_secret
        debug(result)
        DB.read('SELECT * FROM requesttoken WHERE oauth_token = "'+result.oauth_token+'"',(err, res)=>{
          if(res.length <= 0){
            DB.write('INSERT INTO requesttoken (oauth_token, oauth_token_secret) VALUES ("'+result.oauth_token+'", "'+result.oauth_token_secret+'")',(err, res)=>{})
          }else{
            DB.write('UPDATE requesttoken SET oauth_token_secret = "'+result.oauth_token_secret+'" WHERE oauth_token = '+result.oauth_token, (err, res)=>{})
          }
        })
        backSuccess(res, result)
    })
})
router.post('/postLoginRequset', function (req, res, next) {
  sync(function*(api){
    var post = req.body
    var oauth_token = post.oauth_token
    var oauth_token_secret = (yield DB.read('SELECT * FROM requesttoken WHERE oauth_token = "'+oauth_token+'"',api.next))[0].oauth_token_secret
    

    var base_url = 'http://fanfou.com/oauth/access_token'

    var arg = [
        'oauth_consumer_key=' + appkey,
        'oauth_token=' + oauth_token,
        'oauth_signature_method=HMAC-SHA1',
        'oauth_timestamp=' + parseInt(new Date().getTime() / 1000),
        'oauth_nonce=' + crypto.createHash('md5').update('' + Math.floor(Math.random() * 1000)).digest('hex')
    ]

    var baseString = 'GET' + '&' + encodeURIComponent(base_url) + '&' + encodeURIComponent(arg.sort().join('&'))
    var key = encodeURIComponent(appsecret) + '&' + encodeURIComponent(oauth_token_secret)
    debug(key)
    var sig = signture(baseString, key)
    arg.push('oauth_signature=' + sig)
    var url = base_url.replace('http://', 'https://') + '?' + arg.join('&')

    //debug('baseString', baseString)

    request.get(url, function (err, data) {
        if (err)
            return backFail(res, err)

        //debug(data.body)
        var result = queryString.parse(data.body)
        var rawresult = data.body
        debug(result)
        //backSuccess(res, result)
        var getProfileUrl = 'http://api.fanfou.com/users/show.json'
        debug(result)
        var arg = [
          'oauth_consumer_key='+appkey,
          'oauth_token='+result.oauth_token,
          'oauth_signature_method=HMAC-SHA1',
          'oauth_timestamp=' + parseInt(new Date().getTime() / 1000),
          'oauth_nonce=' + crypto.createHash('md5').update('' + Math.floor(Math.random() * 1000)).digest('hex')
        ]
        var baseString = 'GET' + '&' + encodeURIComponent(base_url) + '&' + encodeURIComponent(arg.sort().join('&'))
        var key = encodeURIComponent(appsecret) + '&' + encodeURIComponent(result.oauth_token_secret)
        debug(key)
        var sig = signture(baseString, key)
        arg.push('oauth_signature=' + sig)
        var url = base_url.replace('http://', 'https://') + '?' + arg.join('&')
        request.get(url, function (err, data) {
          if (err) return backFail(res, err)
          debug(data.body)
          backSuccess(res, data.body)
        })
    })
  })
})

function signture(baseString, key) {
  debug(crypto.createHmac('sha1', key).update(baseString).digest('base64'))
    return encodeURIComponent(crypto.createHmac('sha1', key).update(baseString).digest('base64'))
}
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
    if (data != null)
        r.data = data

    res.status(200)
    res.send(r)
}

module.exports = router;
