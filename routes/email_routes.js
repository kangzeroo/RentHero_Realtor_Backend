const axios = require('axios')
const getOAuth2Client = require('../auth/google_token_manager').getOAuth2Client
const grab_access_token = require('../auth/google_token_manager').grab_access_token
const listLabels = require('../api/email_api').listLabels
const grabEmail = require('../api/email_api').grabEmail
const grabThreads = require('../api/email_api').grabThreads
const getThread = require('../api/email_api').getThread
const updateHistoryIdForStaff = require('../Postgres/Queries/UserQueries').updateHistoryIdForStaff
const CHAT_MS = require('./API_URLS').CHAT_MS

// POST /list_email_labels
exports.list_email_labels = function(req, res, next){
  getOAuth2Client('staff_id')
    .then((authClient) => {
      return listLabels(authClient)
    })
    .catch((err) => {
      console.log(err)
    })
}

// POST /watch_route
exports.watch_route = function(req, res, next) {
  const user_id = req.body.user_id
  let token = ''
  let staff_id = ''
  grab_access_token(user_id)
    .then(({ access_token, user_id }) => {
      token = access_token
      staff_id = user_id
      return axios.post(`https://www.googleapis.com/gmail/v1/users/me/watch`, {
          labelIds: ['INBOX'],
          topicName: 'projects/renthero-landlor-1522290344318/topics/RentHero-Landlord-Email-Received'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    })
    .then((data) => {
      console.log('================== watch_route results =================')
      console.log(data.data)
      return updateHistoryIdForStaff(user_id, data.data.historyId)
    })
    .then((data) => {
      res.json({
        message: 'success'
      })
      // console.log(data)
      // // res(data)
      // return axios.post(
      //   `${CHAT_MS}/save_relevant_past_emails`,
      //   {
      //     user_id: staff_id
      //   },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`
      //     }
      //   }
      // )
    })
    // .then((data) => {
    //   console.log(data.data)
    //   res.json(data.data)
    // })
    .catch((err) => {
      console.log(err)
      console.log(err.response)
      console.log(err.response.data)
      // res.status(500).send(err)
      res.json(err)
    })
}

// POST /pull_changes
exports.pull_changes = function(req, res, next) {
  let token = ''
  grab_access_token('staff_id')
    .then(({access_token}) => {
      token = access_token
      const subscription = 'projects/renthero-landlor-1522290344318/subscriptions/Subscribe-To-New-Emails'
      return axios.post(`https://pubsub.googleapis.com/v1/${subscription}:pull`, {
        returnImmediately: true,
        maxMessages: 10,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    })
    .then((data) => {
      console.log('------------ SUBSCRIBED -----------')
      console.log(data.data.receivedMessages.map(m => m.message))
      const messages = data.data.receivedMessages.map(m => Buffer.from(m.message.data, 'base64').toString('utf8'))
      console.log(messages)

      // res(data)
      return axios.post(`https://pubsub.googleapis.com/v1/${subscription}:acknowledge`, {
          ackIds: [data.data.receivedMessages.map(m => m.ackId)]
        }, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })
    })
    .then((data) => {
      console.log('------------ ACKNOWLEDGED -----------')
      console.log(data.data)
    })
    .catch((err) => {
      console.log(err.response.data.error)
      // rej(err)
    })
}

// POST /list_recent_emails
exports.list_recent_emails = function(req, res, next) {
  let token = ''
  grab_access_token('staff_id')
    .then(({access_token}) => {
      token = access_token
      return axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    })
    .then((data) => {
      console.log(data.data)
      res.json(data.data)
    })
    .catch((err) => {
      console.log(err.response.data)
      res.json(err)
    })
}

// POST /get_recent_emails
exports.get_recent_emails = function(req, res, next) {
  let token = ''
  grab_access_token('staff_id')
    .then(({ access_token }) => {
      token = access_token
      return axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    })
    .then((data) => {
      const emails = data.data.messages.map(m => m.id)
      res.json(data.data)
    })
    .catch((err) => {
      console.log(err.response.data)
      res.json(err)
    })
}

// POST /get_email
exports.get_email = function(req, res, next) {
  let access_token = ''
  grab_access_token('staff_id')
    .then((token) => {
      access_token = token
      return grabEmail(req.body.email_id, access_token)
    })
    .then((data) => {
      console.log('========== GET EMAIL ===========')
      console.log(data.data)
      res.json(data.data)
    })
    .catch((err) => {
      console.log(err.response.data)
      res.status(500).send(err)
    })
}

// POST /get_threads
exports.get_threads = function(req, res, next) {
  let token = ''
  grab_access_token('staff_id')
    .then(({ access_token }) => {
      token = access_token
      return grabThreads(token)
    })
    .then((data) => {
      console.log('========== GET THREADS ===========')
      console.log(data.data)
      res.json(data.data)
    })
    .catch((err) => {
      console.log(err.response.data)
      res.status(500).send(err)
    })
}

// POST /get_thread
exports.get_thread = function(req, res, next) {
  let token = ''
  grab_access_token('staff_id')
    .then((access_token) => {
      token = access_token
      return getThread(req.body.thread_id, token)
    })
    .then((data) => {
      console.log('========== GET THREADS ===========')
      console.log(data.data)
      res.json(data.data)
    })
    .catch((err) => {
      console.log(err.response.data)
      res.status(500).send(err)
    })
}
