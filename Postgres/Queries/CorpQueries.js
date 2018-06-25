const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)


exports.get_corporation_from_sql = (corporation_id) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id]
    const queryString = `SELECT *
                           FROM corporation
                           WHERE corporation_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to get corporation')
      }
      res(results)
    })

  })
  return p
}
