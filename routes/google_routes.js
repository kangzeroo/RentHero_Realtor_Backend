const fs = require('fs')
const google = require('googleapis')
const { OAuth2Client } = require('google-auth-library')
const exchange_code_for_refresh_token = require('../auth/google_token_manager').exchange_code_for_refresh_token
const save_refresh_token_to_database = require('../Postgres/Queries/UserQueries').save_refresh_token_to_database

// POST /initial_google_auth
exports.initial_google_auth = function(req, res, next){
  const one_time_code = req.body.code
  const IdentityId = req.body.identityId
  const GoogleId = req.body.googleId
  console.log(req.body)
  exchange_code_for_refresh_token(one_time_code)
    .then((data) => {
      console.log('====================== SUCCESSFULLY EXCHANGED ONE-TIME-CODE FOR REFRESH TOKEN =====================')
      console.log(data.data)
      const expires_at = new Date().getTime() + (data.data.expires_in*1000)
      return save_refresh_token_to_database(data.data.access_token, data.data.refresh_token, IdentityId, GoogleId, expires_at)
    })
    .then((data) => {
      res.json({
        message: 'Success'
      })
    })
    .catch((err) => {
      console.log('====================== ERROR OCCURRED EXCHANGING ONE-TIME-CODE FOR REFRESH TOKEN =====================')
      console.log(err)
      res.status(500).send('Failed to use code')
    })
}
