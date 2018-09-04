const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)


exports.insert_to_proxies_to_intelligence_groups = (agent_id, proxy_id) => {
  const p = new Promise((res, rej) => {
    const values = [agent_id, proxy_id]
    const queryString = `INSERT INTO proxies_to_intelligence_groups (agent_id, proxy_id)
                              VALUES ($1, $2)
                              ON CONFLICT (agent_id, proxy_id)
                              DO NOTHING
                        `

    return query(queryString, values, (err, results) => {
      if (err) {
        console.log(err)
        rej('Failed to associate proxy to intelligence group')
      }
      res({
        message: 'Successfully inserted proxy to intelligence group association'
      })
    })

  })
  return p
}
