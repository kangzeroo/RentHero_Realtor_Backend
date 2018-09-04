const uuid = require('uuid')
const UserQueries = require('../Postgres/Queries/UserQueries')
const generateInitialEmail = require('../api/ses_api').generateInitialEmail

// POST /get_staff_profile
exports.retrieve_staff_profile = function(req, res, next){
  // check if user already exists
  // if not, then save to db with staff account and return the user
  // if yes, then return user
  const info = req.body
  const staff_id = info.staff_id
  const profile = info.profile

  UserQueries.get_staff_profile(staff_id)
    .then((staffData) => {
      console.log('0')
      // console.log(staffData)
      let new_entry = true
      let new_staff = false
      if (staffData.rowCount === 0) {
        return UserQueries.get_staff_by_email(profile.email)
          .then((data) => {
            console.log('get_staff_by_email')
            console.log(data)
            if (data.rowCount > 0) {
              console.log('NEW MEMBER TRUE NEW ENTRY FALSE')
              new_entry = false
              new_staff = true
              return UserQueries.insert_staff_profile_and_relationship(data.rows[0].corporation_id, staff_id, profile)
            } else {
              return UserQueries.insert_staff_profile(staff_id, profile)
            }
          })
          .then((data) => {
            return UserQueries.insert_staff_agent(staff_id, profile)
          })
          .then((data) => {
            return UserQueries.get_staff_profile(staff_id)
          })
          .then((data) => {
            res.json({
              new_entry: new_entry,
              new_staff: new_staff,
              profile: data.rows[0],
            })
          })
          .catch((err) => {
            console.log(err)
            res.status(500).send(err)
          })
      } else {
        console.log('1')
        UserQueries.get_staff_profile(staff_id)
        .then((data) => {
          res.json({
            new_entry: false,
            new_staff: new_staff,
            profile: data.rows[0],
          })
        })
        .catch((err) => {
          res.status(500).send(err)
        })
      }
    })
}


exports.update_staff_profile = (req, res, next) => {
  const info = req.body

  UserQueries.update_staff_profile(info.staff_id, info.first_name, info.last_name, info.email, info.phone, info.title)
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
        return UserQueries.insert_ad_landlord_proxy_relationship(info.ad_id, info.corporation_id, d.staff_id, d.proxy_id)
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

exports.invite_staff_to_corporation = (req, res, next) => {
  const info = req.body
  const staff_id = uuid.v4()

  UserQueries.get_staff_by_email(info.email)
    .then((data) => {
      console.log(data)
      if (data.rowCount > 0) {
        // res.status(500).send('Email is already used in an account')
        console.log('EMAIL ALREADY USER')
        res.json({
          error: 'Email address is already used in an account'
        })
      } else {
        return UserQueries.invite_staff_to_corporation(info.corporation_id, staff_id, info.title, info.email)
          .then((data) => {
            console.log('generating email...')
            return generateInitialEmail(info.email, info.corporation_name)
          })
          .then((data) => {
            console.log(data)
            res.json({
              message: data.message
            })
          })
      }
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}
