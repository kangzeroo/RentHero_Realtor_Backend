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
                                b.proxy_id, b.proxy_email, b.proxy_phone, c.pool_id
                           FROM corporation a
                           LEFT OUTER JOIN corporation_proxy b
                           ON a.corporation_id = b.corporation_id
                           LEFT OUTER JOIN corporation_pool c
                           ON a.corporation_id = c.corporation_id
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
          const values3 = [staff_id]
          const updateStaff = `UPDATE staff
                                  SET title = 'admin'
                                WHERE staff_id = $1
                              `
          query(updateStaff, values3, (err, results) => {
            if (err) {
              console.log('ERROR 4')
              console.log(err)
              rej('Error #4 has occurred')
            }
            query('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction: ', err)
                rej('Error committing transaction')
              }
              res('Successfully created public company')
            })
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

exports.add_proxy_email_to_corp = (corporation_id, proxy_email_base) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id, proxy_email_base.concat(`${process.env.NODE_ENV === 'production' ? '@flexximail.org' : '@devproxyemail.net'}`)]
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
    console.log(values)
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

exports.get_staffs_for_corporation = (corporation_id) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id]
    const getStaffs = `SELECT b.staff_id, b.first_name, b.last_name,
                              b.email, b.phone, b.title, b.thumbnail,
                              b.updated_at, b.created_at,
                              JSON_BUILD_OBJECT('agent_id', d.agent_id, 'friendly_name', d.friendly_name, 'email', d.email, 'phone', d.phone) AS agent
                         FROM corporation_staff a
                         INNER JOIN staff b
                         ON a.staff_id = b.staff_id
                         INNER JOIN staff_agent c
                         ON a.staff_id = c.staff_id
                         INNER JOIN agents d
                         ON c.agent_id = d.agent_id
                         WHERE a.corporation_id = $1
                      `

    query(getStaffs, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to get staffs')
      }
      res(results.rows)
    })
  })
  return p
}

exports.update_team_member = (staff_id, title) => {
  const p = new Promise((res, rej) => {
    const values = [staff_id, title]
    const updateQuery = `UPDATE staff
                            SET title = $2,
                                updated_at = CURRENT_TIMESTAMP
                          WHERE staff_id = $1
                        `

    query(updateQuery, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to update team member')
      }
      res({
        message: 'Successfully updated team member'
      })
    })
  })
  return p
}

exports.delete_team_member = (staff_id, corporation_id, corporation_name) => {
  const p = new Promise((res, rej) => {
    query('BEGIN', (err) => {
      if (err) {
        console.log('BEGIN ERROR: ', err)
        rej('Failed to remove team member')
      }
      const values = [corporation_id, staff_id]
      const removeRelationship = `DELETE FROM corporation_staff
                                        WHERE corporation_id = $1
                                          AND staff_id = $2
                                 `

      query(removeRelationship, values, (err, results) => {
        if (err) {
          console.log('ERROR: ', err)
          rej('Failed to remove team member')
        }
        const values2 = [staff_id]
        const removeStaff = `DELETE FROM staff
                                   WHERE staff_id = $1
                            `

        query(removeStaff, values2, (err, results) => {
          if (err) {
            console.log('ERROR: ', err)
            rej('Failed to remove team member')
          }
          query('COMMIT', (err) => {
            if (err) {
              console.log('ERROR: ', err)
              rej('Failed to remove team member')
            }
            res({
              message: `Successfully removed team member from ${corporation_name}`
            })
          })
        })
      })
    })
  })
  return p
}

exports.create_corporation_pool = (corporation_id, corporation_name) => {
  const p = new Promise((res, rej) => {
    query('BEGIN', (err) => {
      if (err) {
        console.log(err)
        rej('An Error Ocurred')
      }
      const pool_id = `PL${uuid.v4()}`
      const values = [pool_id, corporation_name]
      const queryString = `INSERT INTO lead_pools (pool_id, name)
                              VALUES ($1, $2)
                            RETURNING pool_id
                          `

      query(queryString, values, (err, results) => {
        if (err) {
          console.log(err)
          rej('An Error Ocurred')
        }
        const pool_id = results.rows[0].pool_id
        const values2 = [corporation_id, pool_id]
        const queryString2 = `INSERT INTO corporation_pool (corporation_id, pool_id)
                                    VALUES ($1, $2)
                                    ON CONFLICT (corporation_id, pool_id)
                                    DO NOTHING
                              `

        query(queryString2, values2, (err, results) => {
          if (err) {
            console.log(err)
            rej('An Error Ocurred')
          }

          query('COMMIT', (err) => {
            if (err) {
              console.log(err)
              rej('An Error Occurred')
            }
            res({
              message: 'Successfully Created Corporation Pool',
              pool_id: pool_id,
            })
          })
        })
      })
    })
  })
  return p
}
