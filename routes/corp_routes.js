const get_corporation_from_sql = require('../Postgres/Queries/CorpQueries').get_corporation_from_sql

exports.get_corporation_profile = (req, res, next) => {
  const info = req.body

  if (info.corporation_id) {
    get_corporation_from_sql(info.corporation_id)
      .then((data) => {
        if (data.rowCount === 0) {
          res.json('')
        } else {
          res.json(results.rows[0])
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
