var express = require('express')
var router = express.Router()
var DB = require('./class/db')
var sync = require('sync_back').run
var debug = require('debug')('wolf:api')


router.get('/test', function(req, res, next){
  backSuccess(res)
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
    if (data != null)
        r.data = data

    res.status(200)
    res.send(r)
}
function isLogin(req) {
    if (req.session.uid != null)
        return true
    return false
}
function checkLogin(req, res) {
    if (isLogin(req))
        return false

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
