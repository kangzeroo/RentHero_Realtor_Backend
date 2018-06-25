const google = require('googleapis')
const getOAuth2Client = require('../auth/google_token_manager').getOAuth2Client
const grab_access_token = require('../auth/google_token_manager').grab_access_token
const axios = require('axios')

// Used with the official gmail api, but not with our library
exports.listLabels = function(authClient) {
  console.log(authClient)
  console.log('========= LIST LABELS ===========')
  const p = new Promise((res, rej) => {
    const gmail = google.gmail('v1')
    gmail.users.labels.list({
      auth: authClient,
      userId: 'me',
    }, (err, response) => {
      if (err) {
        console.log(err)
        console.log('The API returned an error: ' + err)
        return
      }
      var labels = response.labels
      if (labels.length == 0) {
        console.log('No labels found.')
      } else {
        console.log('Labels:')
        for (var i = 0; i < labels.length; i++) {
          var label = labels[i]
          console.log('- %s', label.name)
        }
      }
    })
  })
  return p
}

exports.watchEmails = function(authClient) {
  console.log(authClient)
  console.log('========= WATCH EMAILS ===========')
  const p = new Promise((res, rej) => {
    const gmail = google.gmail('v1')
    const options = {
      userId: 'me',
      auth: authClient,
      resource: {
          labelIds: ['INBOX'],
          topicName: 'projects/renthero-landlor-1522290344318/topics/RentHero-Landlord-Email-Received	'
      }
    }
    gmail.users.watch(options, (err, response) => {
      if (err) {
        console.log(err)
        console.log('The API returned an error: ' + err)
        return
      }
      console.log(response.data)
    })
  })
  return p
}

exports.grabEmail = function(emailId, access_token) {
  console.log(emailId)
  const p = new Promise((res, rej) => {
    axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=minimal`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then((data) => {
        console.log(data)
        res(data)
      })
      .catch((err) => {
        console.log(err.response.data)
        rej(err)
      })
  })
  return p
}

exports.grabThreads = function(access_token) {
  const p = new Promise((res, rej) => {
    axios.get(`https://www.googleapis.com/gmail/v1/users/me/threads`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then((data) => {
        console.log(data)
        res(data)
      })
      .catch((err) => {
        console.log(err.response.data)
        rej(err)
      })
  })
  return p
}

exports.getThread = function(thread_id, access_token) {
  const p = new Promise((res, rej) => {
    axios.get(`https://www.googleapis.com/gmail/v1/users/me/threads/${thread_id}?format=minimal`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then((data) => {
        console.log(data)
        res(data)
      })
      .catch((err) => {
        console.log(err.response.data)
        rej(err)
      })
  })
  return p
}
