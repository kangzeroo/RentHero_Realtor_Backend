const generateInitialEmail = require('../api/ses_api').generateInitialEmail

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

exports.email_test = function(req, res, next){
  generateInitialEmail('support@renthero.com', 'test corp')
    .then((data) => {
      console.log(data)
      res.json({
        message: 'Email test success'
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
