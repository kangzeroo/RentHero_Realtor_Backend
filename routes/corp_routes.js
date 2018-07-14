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

exports.add_proxy_email_to_corp = (req, res, next) => {
  const info = req.body

  CorpQueries.add_proxy_email_to_corp(info.corporation_id, info.proxy_email)
    .then((data) => {
      res.json({
        message: data.message,
        proxy_id: data.proxy_id,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.add_proxy_fallback = (req, res, next) => {
  const info = req.body

  CorpQueries.add_proxy_fallback(info.proxy_id, info.proxy_email)
    .then((data) => {
      res.json({
        message: data.message,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.get_staffs_for_corporation = (req, res, next) => {
  const info = req.body

  CorpQueries.get_staffs_for_corporation(info.corporation_id)
    .then((data) => {
      res.json(data)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.update_team_member = (req, res, next) => {
  const info = req.body

  CorpQueries.update_team_member(info.staff_id, info.title)
    .then((data) => {
      res.json({
        message: data.message,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}

exports.delete_team_member = (req, res, next) => {
  const info = req.body

  CorpQueries.delete_team_member(info.staff_id, info.corporation_id, info.corporation_name)
    .then((data) => {
      res.json({
        message: data.message,
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}
