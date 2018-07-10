const insert_staff_profile = require('../Postgres/Queries/UserQueries').insert_staff_profile
const UserQueries = require('../Postgres/Queries/UserQueries')

// POST /get_staff_profile
exports.get_staff_profile = function(req, res, next){
  // check if user already exists
  // if not, then save to db with staff account and return the user
  // if yes, then return user
}


exports.update_staff_profile = (req, res, next) => {
  const info = req.body

  UserQueries.update_staff_profile(info.staff_id, info.first_name, info.last_name, info.email, info.phone)
    .then((data) => {
      res.json({
        message: data.message,
      })
    })
    .catch((err) => {
      res.status(500).send(err)
    })
}
