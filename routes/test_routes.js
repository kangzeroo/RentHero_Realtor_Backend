
// GET /test
exports.test = function(req, res, next){
  res.json({
    message: "Test says alive and well"
  })
}

// POST /auth_test
exports.auth_test = function(req, res, next){
  res.json({
    message: "Auth test says alive and well"
  })
}
