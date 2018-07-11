docker run --log-opt max-size=500m -d -it -p 7101:7101 --name=realtor_backend realtor_backend npm run prod -- --host=0.0.0.0
