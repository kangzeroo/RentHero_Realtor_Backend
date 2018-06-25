docker run --log-opt max-size=500m -d -it -p 8101:8101 --name=landlord_auth_ms landlord_auth_ms npm run staging -- --host=0.0.0.0
