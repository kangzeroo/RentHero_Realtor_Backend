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
    const queryString = `SELECT corporation_id, corporation_name
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

exports.create_corporation_for_staff = (corporation_id, corporation_name, staff_id) => {
  const p = new Promise((res, rej) => {
    query('BEGIN', (err) => {
      if (err) {
        console.log('ERROR')
        console.log(err)
        rej('An error occurred')
      }
      const values = [corporation_id, corporation_name]
      console.log(values)
      const insertCorporation = `INSERT INTO corporation (corporation_id, corporation_name) VALUES ($1, $2)`
      query(insertCorporation, values, (err, results) => {
        if (err) {
          console.log('ERROR 2')
          console.log(err)
          rej('Error #2 has occured')
        }
        const values2 = [corporation_id, staff_id]
        const insertCorpStaff = `INSERT INTO corporation_staff (corporation_id, staff_id)
                                      VALUES ($1, $2)
                                      ON CONFLICT (corporation_id, staff_id)
                                      DO NOTHING
                                `
        query(insertCorpStaff, values2, (err, results) => {
          if (err) {
            console.log('ERROR 3')
            console.log(err)
            rej('Error #3 has occurred')
          }
          query('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction')
              rej('Error committing transaction')
            }
            res('Successfully created public company')
          })
        })
      })
    })
  })
  return p
}
