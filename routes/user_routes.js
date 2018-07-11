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

exports.insert_multi_ad_landlord_proxy_relationship = (req, res, next) => {
  const info = req.body

  UserQueries.get_staffs_and_proxy_from_corporation(info.corporation_id)
    .then((data) => {
      console.log(data)
      const arrayOfPromises = data.map((d) => {
        return UserQueries.insert_ad_landlord_proxy_relationship(info.ad_id, info.corporation_id, d.staff_email, d.proxy_email)
          .then((data) => { console.log(data) })
          .catch((err) => { console.log(err) })
      })

      return Promise.all(arrayOfPromises)
    })
    .then((data) => {
      console.log(data)
      res.json({
        message: 'Successful'
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Failed')
    })

}
