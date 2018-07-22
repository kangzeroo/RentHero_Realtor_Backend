const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

const json_rows = res => res.map(row => JSON.parse(row))
//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}

exports.get_staff_profile = (staff_id) => {
  console.log('get_staff_profile')
  const p = new Promise((res, rej) => {
    const values = [staff_id]

    const queryString = `SELECT a.staff_id, a.first_name, a.last_name,
                                a.email, a.phone, a.title,
                                a.updated_at, a.created_at,
                                b.corporation_id
                           FROM staff a
                           LEFT OUTER JOIN corporation_staff b
                             ON a.staff_id = b.staff_id
                          WHERE a.staff_id = $1`

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      res(results)
    })
  })
  return p
}

exports.updateHistoryIdForStaff = function(staff_id, historyId) {
  const p = new Promise((res, rej) => {
    const values = [staff_id, historyId]
    let update_history_id = `UPDATE google_refresh_tokens SET history_id = $2 WHERE aws_identity_id = $1 `

    return query(update_history_id, values)
      .then((data) => {
        console.log(data)
        res('success')
      })
      .catch((err) => {
        console.log(err)
        rej(err)
      })
  })
  return p
}

exports.grab_refresh_token = function(staff_id) {
  const p = new Promise((res, rej) => {
    const values = [staff_id]
    const grab_token = `SELECT a.aws_identity_id, a.google_identity_id, a.google_access_token, a.google_refresh_token, a.created_at, a.expires_at, a.history_id,
                               b.staff_id, b.first_name, b.last_name, b.email, b.phone
                          FROM google_refresh_tokens a
                          INNER JOIN staff b ON a.aws_identity_id = b.staff_id
                          WHERE a.aws_identity_id = $1 ORDER BY a.created_at DESC LIMIT 1`

    return query(grab_token, values)
    .then((data) => {
      res(data.rows[0])
    })
    .catch((err) => {
      console.log(err)
      rej(err)
    })
  })
  return p
}

exports.insert_staff_profile = (staff_id, profile) => {
  console.log('insert_staff_profile')
  const p = new Promise((res, rej) => {
    const values = [staff_id, profile.first_name, profile.last_name, profile.pic, profile.email]

    let insert_profile = `INSERT INTO staff (staff_id, first_name, last_name, thumbnail, email)
                               VALUES ($1, $2, $3, $4, $5)
                               ON CONFLICT (email)
                               DO UPDATE SET staff_id = $1,
                                             first_name = $2,
                                             last_name = $3,
                                             thumbnail = $4,
                                             updated_at = CURRENT_TIMESTAMP
                         `

    query(insert_profile, values, (err, results) => {
      if (err) {
        console.log(err)
        rej(err)
      }
      res('success')
    })
  })
  return p
}

exports.insert_staff_agent = (staff_id, profile) => {
  const p = new Promise((res, rej) => {
    const values = [staff_id]
    const queryString = `SELECT * FROM staff_agent WHERE staff_id = $1`
    query('BEGIN', (err) => {
      if (err) {
        console.log('ERROR: ', err)
        rej(err)
      }
      query(queryString, values, (err, results) => {
        if (err) {
          console.log('ERROR: ', err)
          rej(err)
        }
        if (results.rowCount > 0) {
          query('COMMIT', (err) => {
            if (err) {
              console.log('ERROR: ', err)
              rej(err)
            }
            res()
          })
        } else {
          const agent_id = uuid.v4()
          const new_email = profile.email.split('@')[0].concat(`.${uuid.v4()}@renthero.tech`)
          const values2 = [agent_id, profile.first_name, profile.last_name, new_email]
          const queryString2 = `INSERT INTO agents (agent_id, first_name, last_name, email)
                                      VALUES ($1, $2, $3, $4)
                              `

          query(queryString2, values2, (err, results) => {
            if (err) {
              console.log('ERROR: ', err)
              rej(err)
            }
            const values3 = [staff_id, agent_id]
            const queryString3 = `INSERT INTO staff_agent (staff_id, agent_id) VALUES ($1, $2)
                                    ON CONFLICT (staff_id) DO NOTHING
                                 `

            query(queryString3, values3, (err, results) => {
              if (err) {
                console.log('ERROR: ', err)
                rej(err)
              }
              query('COMMIT', (err) => {
                if (err) {
                  console.log('ERROR: ', err)
                  rej(err)
                }
                res()
              })
            })
          })
        }
      })
    })
  })
  return p
}

exports.insert_corporation_staff_relationship = (corporation_id, staff_id) => {
  console.log('insert_corporation_staff_relationship')
  const p = new Promise((res, rej) => {
    const values = [corporation_id, staff_id]
    const insertRel = `INSERT INTO corporation_staff (corporation_id, staff_id)
                            VALUES ($1, $2)
                            ON CONFLICT (corporation_id, staff_id)
                            DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                      `

    query(insertRel, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to insert_corporation_staff_relationship')
      }
      res({
        messsage: 'Successful'
      })
    })
  })
  return p
}

exports.insert_staff_profile_and_relationship = (corporation_id, staff_id, profile) => {
  const p = new Promise((res, rej) => {
    query('BEGIN', (err) => {
      if (err) {
        console.log('TRANSACTION BEGIN ERROR: ', err)
        rej('transaction error occurred')
      }
      const values = [staff_id, profile.first_name, profile.last_name, profile.pic, profile.email]

      let insert_profile = `INSERT INTO staff (staff_id, first_name, last_name, thumbnail, email)
                                 VALUES ($1, $2, $3, $4, $5)
                                 ON CONFLICT (email)
                                 DO UPDATE SET staff_id = $1,
                                               first_name = $2,
                                               last_name = $3,
                                               thumbnail = $4,
                                               updated_at = CURRENT_TIMESTAMP
                             RETURNING staff_id
                           `

      query(insert_profile, values, (err, results) => {
        if (err) {
          console.log(err)
          rej(err)
        }
        const values2 = [corporation_id, results.rows[0].staff_id]
        const insertRel = `INSERT INTO corporation_staff (corporation_id, staff_id)
                                VALUES ($1, $2)
                                ON CONFLICT (corporation_id, staff_id)
                                DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                          `

        query(insertRel, values2, (err, results) => {
          if (err) {
            console.log(err)
            rej('Failed to insert_corporation_staff_relationship')
          }
          query('COMMIT', (err) => {
            if (err) {
              console.log('Error committing transaction: ', err)
              rej('Failed')
            }
            res({
              message: 'Successfull'
            })
          })
        })
      })
    })
  })
  return p
}

exports.update_refresh_token = function(data, staff_id) {
  console.log('========== update_refresh_token ===========')
  console.log('staff_id: ', staff_id)
  console.log(data)
  const p = new Promise((res, rej) => {
    const expires_at = new Date().getTime() + (data.expires_in*1000)
    const values = [staff_id, data.access_token, expires_at]

    let insert_profile = `UPDATE google_refresh_tokens SET google_access_token = $2, expires_at = $3 WHERE aws_identity_id = $1`

    return query(insert_profile, values)
    .then((data) => {
      res('success')
    })
    .catch((err) => {
      console.log(err)
      rej(err)
    })
  })
  return p
}

exports.save_refresh_token_to_database = (access_token, refresh_token, identityId, googleId, expires_at) => {
  const p = new Promise((res, rej) => {
    const values = [refresh_token, identityId, googleId, expires_at, access_token]

    let insert_tokens = `INSERT INTO google_refresh_tokens (aws_identity_id, google_identity_id, google_refresh_token, expires_at, google_access_token)
                              VALUES ($2, $3, $1, $4, $5)
                              ON CONFLICT (aws_identity_id) DO UPDATE SET google_refresh_token = $1, expires_at = $4, google_access_token = $5
                        `

    query(insert_tokens, values)
      .then((data) => {
        console.log('INSERTED')
        res('INSERTED')
      })
      .catch((error) => {
        console.log(error)
        rej('bad boi bad boi')
      })
  })
  return p
}


exports.update_staff_profile = (staff_id, first_name, last_name, email, phone, title) => {
  const p = new Promise((res, rej) => {
    const values = [staff_id, first_name, last_name, email, phone, title]
    const updateUser = `UPDATE staff
                           SET first_name = $2,
                               last_name = $3,
                               email = $4,
                               phone = $5,
                               title = $6,
                               updated_at = CURRENT_TIMESTAMP
                         WHERE staff_id = $1
                       `

    query(updateUser, values, (err, results) => {
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

exports.get_staffs_and_proxy_from_corporation = (corporation_id) => {
  const p = new Promise((res, rej) => {
    const values = [corporation_id]
    const queryString = `SELECT b.staff_id, b.email AS staff_email, c.proxy_email, c.proxy_id
                           FROM corporation_staff a
                           INNER JOIN staff b ON a.staff_id = b.staff_id
                           INNER JOIN corporation_proxy c ON a.corporation_id = c.corporation_id
                          WHERE a.corporation_id = $1
                        `

    query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to get staffs and proxies')
      }
      res(results.rows)
    })
  })
  return p
}

exports.insert_ad_landlord_proxy_relationship = (ad_id, corporation_id, staff_id, proxy_id) => {
  const p = new Promise((res, rej) => {
    const values = [ad_id, corporation_id, staff_id, proxy_id]
    const insertAd = `INSERT INTO ad_landlord_proxy_relationship (ad_id, corporation_id, staff_id, proxy_id)
                             VALUES ($1, $2, $3, $4)
                     `

    query(insertAd, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to insert ad landlord proxy relationship')
      }
      res({
        message: 'Successfully inserted ad proxy relationship'
      })
    })
  })
  return p
}

exports.get_staff_by_email = (email) => {
  console.log('get_staff_by_email')
  const p = new Promise((res, rej) => {
    const values = [email]
    const getStaff = `SELECT a.staff_id, b.corporation_id
                        FROM staff a
                        LEFT OUTER JOIN corporation_staff b
                        ON a.staff_id = b.staff_id
                       WHERE a.email = $1
                      `

    query(getStaff, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to get staff')
      }
      res(results)
    })
  })
  return p
}

exports.invite_staff_to_corporation = (corporation_id, staff_id, title, email) => {
  const p = new Promise((res, rej) => {
    query('BEGIN', (err) => {
      if (err) {
        console.log('TRANSACTION BEGIN ERROR: ', err)
        rej('transaction error occurred')
      }
      const values = [staff_id, title, email]
      const inviteStaff = `INSERT INTO staff (staff_id, title, email)
                                VALUES ($1, $2, $3)
                            ON CONFLICT (email) DO NOTHING
                          `
      query(inviteStaff, values, (err, results) => {
        if (err) {
          console.log('ERROR 2: ', err)
          rej('Failed to invite staff')
        }
        const values2 = [corporation_id, staff_id]
        const connectStaff = `INSERT INTO corporation_staff (corporation_id, staff_id)
                                    VALUES ($1, $2)
                                    ON CONFLICT (corporation_id, staff_id)
                                    DO NOTHING
                             `
        query(connectStaff, values2, (err, results) => {
          if (err) {
            console.log('ERROR 3: ', err)
            rej('Failed to invite staff')
          }
          query('COMMIT', (err) => {
            if (err) {
              console.log('Error committing transaction: ', err)
              rej('Failed to invite staff')
            }
            res({
              message: 'Successfully invited staff'
            })
          })
        })
      })
    })
  })
  return p
}
