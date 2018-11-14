const bodyParser = require('body-parser')

// security
const Google_JWT_Check = require('./auth/googleJWTCheck').Google_JWT_Check
const originCheck = require('./auth/originCheck').originCheck

// routes
const Test = require('./routes/test_routes')
const GoogleRoutes = require('./routes/google_routes')
const UserRoutes = require('./routes/user_routes')
const CorpRoutes = require('./routes/corp_routes')
const EmailRoutes = require('./routes/email_routes')
const UserQueries = require('./Postgres/Queries/UserQueries')
const ProxyRoutes = require('./routes/proxy_routes')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// tests
	app.get('/test', json_encoding, Test.test)
	app.get('/email_test', json_encoding, Test.email_test)

	app.post('/auth_test', [json_encoding, originCheck, Google_JWT_Check], Test.auth_test)

	// auth
	app.post('/initial_google_auth', [json_encoding, originCheck, Google_JWT_Check], GoogleRoutes.initial_google_auth)
	app.post('/retrieve_staff_profile', [json_encoding, originCheck, Google_JWT_Check], UserRoutes.retrieve_staff_profile)
	app.post('/watch_route', [json_encoding, originCheck], EmailRoutes.watch_route)

	// corp
	app.post('/get_corporation_profile', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.get_corporation_profile)
	app.post('/create_corporation', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.create_corporation)
	app.post('/create_corporation_pool', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.create_corporation_pool)
	app.post('/update_corp_profile', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.update_corp_profile)
	app.post('/add_proxy_email_to_corp', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.add_proxy_email_to_corp)
	app.post('/add_proxy_fallback', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.add_proxy_fallback)
	app.post('/get_staffs_for_corporation', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.get_staffs_for_corporation)
	app.post('/update_team_member', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.update_team_member)
	app.post('/delete_team_member', [json_encoding, originCheck, Google_JWT_Check], CorpRoutes.delete_team_member)

	// user
	app.post('/update_staff_profile', [json_encoding, originCheck, Google_JWT_Check], UserRoutes.update_staff_profile)
	app.post('/insert_ad_landlord_proxy_relationship', [json_encoding, originCheck, Google_JWT_Check], UserRoutes.insert_multi_ad_landlord_proxy_relationship)
	app.post('/invite_staff_to_corporation', [json_encoding, originCheck, Google_JWT_Check], UserRoutes.invite_staff_to_corporation)

	// email
	// app.post('/get_recent_emails', [json_encoding, originCheck], EmailRoutes.get_recent_emails)
	// app.post('/pull_changes', [json_encoding, originCheck], EmailRoutes.pull_changes)
	// app.post('/get_email', [json_encoding, originCheck], EmailRoutes.get_email)
	// app.post('/get_threads', [json_encoding, originCheck], EmailRoutes.get_threads)
	// app.post('/get_thread', [json_encoding, originCheck], EmailRoutes.get_thread)

	// proxy routes
	app.post('/insert_proxy_intel_association', [json_encoding, originCheck, Google_JWT_Check], ProxyRoutes.insert_proxy_intel_association)
}
