const ProxyQueries = require('../Postgres/Queries/ProxyQueries')


exports.insert_proxy_intel_association = (req, res, next) => {
  const info = req.body

  const arrayOfPromises = info.agent_ids.map((agent_id) => {
    return ProxyQueries.insert_to_proxies_to_intelligence_groups(agent_id, info.proxy_id)
  })

  Promise.all(arrayOfPromises)
    .then((data) => {
      console.log(data)
      res.json({
        message: 'Successfully associated proxies to intelligence groups'
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send('Failed to associated proxy to intelligence groups')
    })
}
