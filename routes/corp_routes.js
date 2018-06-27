const uuid = require('uuid')
const get_corporation_from_sql = require('../Postgres/Queries/CorpQueries').get_corporation_from_sql
const create_corporation_for_staff = require('../Postgres/Queries/CorpQueries').create_corporation_for_staff

exports.get_corporation_profile = (req, res, next) => {
  const info = req.body

  if (info.corporation_id) {
    get_corporation_from_sql(info.corporation_id)
      .then((data) => {
        if (data.rowCount === 0) {
          res.json('')
        } else {
          res.json(data.rows[0])
        }
      })
      .catch((err) => {
        res.status(500).send(err)
      })
  } else {
    console.log('RED FLAG')
    res.json('')
  }
}

exports.create_corporation = (req, res, next) => {
  const info = req.body
  const corporation_id = uuid.v4()

  if (info.corporation_name && info.staff_id) {
    create_corporation_for_staff(corporation_id, info.corporation_name, info.staff_id)
      .then((message) => {
        res.json({
          message: message,
          corporation_profile: {
            corporation_id: corporation_id,
            corporation_name: info.corporation_name,
          }
        })
      })
      .catch((err) => {
        res.status(500).send('Failed to create company name')
      })
  } else {
    console.log('RED FLAG')
    console.error('RED FLAG')
    res.status(500).send('RED FLAG')
  }
}
