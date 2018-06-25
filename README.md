
# Landlord Auth Microservice [PORT:7101]
This microservice handles authentication of landlords on RentHero v4. Specifically for the frontend client `RentHero_Landlord_Controls`.

## Main functions
- `POST /initial_google_auth` receives a google_code from the user logging in which grants server-side access to this landlord's gmail inbox <br/>
- `save_relevant_past_emails()` is a function that fires after `POST/initial_google_auth`. It queries the landlord's gmail inbox for past emails relevant to RentHero. Used for outreach to past tenants. Currently this function is not being used, and needs to be transfered over from `Chat_MS` repo<br/>

## Credentials & Dependencies
- Requires `client_google_oauth.json`, `client_ids.js`, `google_oauth.json`, `.env`, `aws_config.js`, `config.js` for database, and SSL certificates <br/>
- Requires a server-side Google OAuth account AND client-side Google OAuth account, which is set up in the Google Developer Cloud Console <br/>
