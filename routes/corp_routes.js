const uuid = require('uuid')
const CorpQueries = require('../Postgres/Queries/CorpQueries')

exports.get_corporation_profile = (req, res, next) => {
  const info = req.body

  if (info.corporation_id) {
    CorpQueries.get_corporation_from_sql(info.corporation_id)
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
    CorpQueries.create_corporation_for_staff(corporation_id, info.corporation_name, info.staff_id)
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

exports.update_corp_profile = (req, res, next) => {
  const info = req.body
  console.log(info)

  CorpQueries.update_corporation_profile(info.corporation_id, info.corporation_name)
    .then((data) => {
      res.json({
        message: data.message
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}
