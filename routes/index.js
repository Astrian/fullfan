var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.user == null) res.render('index');
  else res.redirect('/home')
});
router.get('/logincallback', function(req, res, next) {
  if (req.session.user == null) res.render('logincallback');
  else res.redirect('/home')
});
module.exports = router;
