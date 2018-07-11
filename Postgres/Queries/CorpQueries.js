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
    const queryString = `SELECT a.corporation_id, a.corporation_name, a.created_at, a.updated_at,
                                b.proxy_email, b.proxy_phone
                           FROM corporation a
                           LEFT OUTER JOIN corporation_proxy b
                           ON a.corporation_id = b.corporation_id
                           WHERE a.corporation_id = $1
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

exports.update_corporation_profile = (corporation_id, corporation_name) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id, corporation_name]
    const updateCorp = `UPDATE corporation
                           SET corporation_name = $2
                           WHERE corporation_id = $1
                       `

    query(updateCorp, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to update profile')
      }
      res({
        message: 'Successfully updated profile'
      })
    })
  })
  return p
}

exports.add_proxy_email_to_corp = (corporation_id, proxy_email) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id, proxy_email]
    const addProxy = `INSERT INTO corporation_proxy (corporation_id, proxy_email)
                           VALUES ($1, $2)
                           ON CONFLICT (corporation_id)
                           DO UPDATE SET proxy_email = $2,
                                         updated_at = CURRENT_TIMESTAMP
                      RETURNING proxy_id
                     `

    query(addProxy, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to save email')
      }
      res({
        message: 'Successfully saved email',
        proxy_id: results.rows[0].proxy_id
      })
    })
  })
  return p
}

exports.add_proxy_fallback = (proxy_id, email) => {
  const p = new Promise((res, rej) => {
    const values = [proxy_id, email, 'default']
    const addProxy = `INSERT INTO proxy_fallback (proxy_id, email, type)
                            VALUES ($1, $2, $3)
                            ON CONFLICT (proxy_id)
                            DO UPDATE SET email = $2,
                                          updated_at = CURRENT_TIMESTAMP
                     `

    query(addProxy, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to add proxy fallback')
      }
      res({
        message: 'Successfully added proxy fallback'
      })
    })
  })
  return p
}
