const axios = require('axios');
const https = require('https');
var btoa = require('btoa');

const api_key = process.env.API_KEY;
const secret_key = process.env.SECRET_KEY;
const content_type = 'application/json';
const source_addr = 'MOWASU';

function send_sms(message, receiver) {
  axios
    .post(
      'https://apisms.beem.africa/v1/send',
      {
        source_addr: source_addr,
        schedule_time: '',
        encoding: 0,
        message: message,
        recipients: [receiver],
      },
      {
        headers: {
          'Content-Type': content_type,
          Authorization: 'Basic ' + btoa(api_key + ':' + secret_key),
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    )
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => console.error(error));
}

module.exports = {
  send_sms,
};
