// AWS SES (Simple Email Service) for sending emails via Amazon
const AWS_SES = require('aws-sdk/clients/ses')
const AWS = require('aws-sdk/global')
const ses = new AWS_SES({
  region: 'us-east-1'
})

exports.generateInitialEmail = function(toEmail, corporation_name){
  const p = new Promise((res, rej) => {
		if (!toEmail || toEmail.length === 0) {
			rej('Missing from email, proxy email, or message')
		} else {
			const params = createInitialParams(toEmail, corporation_name)
			// console.log('Sending email with attached params!')
			AWS.config.credentials.refresh(function() {
				// console.log(AWS.config.credentials)
				ses.sendEmail(params, function(err, data) {
				  if (err) {
				  	 console.log('ERROR: ', err); // an error occurred
				  	 rej(err)
				  } else {
				  	console.log(data);           // successful response
  					res({
              message: 'Success! Initial mail sent',
              data: data,
            })
          }
				})
			})
		}
	})
	return p
}

function createInitialParams(toEmail, corporation_name){
  const params = {
	  Destination: { /* required */
	    BccAddresses: [
        'email.records.rentburrow@gmail.com'
      ],
	    CcAddresses: [],
	    ToAddresses: [
        toEmail
      ]
	  },
	  Message: { /* required */
	    Body: { /* required */
	      Html: {
	        Data: generateHTMLInquiryEmail_Landlord(toEmail, corporation_name),
	        Charset: 'UTF-8'
	      },
	    },
	    Subject: { /* required */
	      Data: 'Invitation to RentHero from ' + corporation_name, /* required */
	      Charset: 'UTF-8'
	    }
	  },
	  Source: 'support@renthero.com',
	}
	return params
}

// generate the HTML email
function generateHTMLInquiryEmail_Landlord(toEmail, corporation_name){
	return `
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset='UTF-8' />
		    <title>title</title>
		  </head>
		  <body>
		  	<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
		    <tr>
		        <td align='center' valign='top'>
		            <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
		                <tr style='background-color:#99ccff;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
                                <tr>
                                    <td align='center' valign='top' style='color:#337ab7;'>
                                        <h2>RentHero Invitation</h2>
                                    </td>
                                </tr>
		                            <tr>
		                                <td align='center' valign='top' style='color:#337ab7;'>
		                                    <h3>You have been invited to join ${corporation_name}'s team on RentHero</h3>
		                                </td>
		                            </tr>
		                            <tr style='border: 1px solid red; font-size: 1.2rem'>
		                                <td align='center' valign='top'>
		                                    <p>Please sign up using ${toEmail}</p>
		                                </td>
		                            </tr>
		                            <tr style='font-size: 1.2rem'>
		                                <td align='center' valign='top'>
                                        <br /><br />
                                        <a href="https://app.renthero.com/">Accept Invitation</a>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    </table>
		  </body>
		</html>
	`
}
