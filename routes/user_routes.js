const insert_staff_profile = require('../Postgres/Queries/UserQueries').insert_staff_profile
const retrieve_staff_profile = require('../Postgres/Queries/UserQueries').retrieve_staff_profile

// POST /get_staff_profile
exports.get_staff_profile = function(req, res, next){
  // check if user already exists
  // if not, then save to db with staff account and return the user
  // if yes, then return user
}
