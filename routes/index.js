var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.uid == null) res.render('index');
  else res.redirect('/home')
});
module.exports = router;
