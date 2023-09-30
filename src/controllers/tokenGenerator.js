const axios = require('axios');
const qs = require('qs');

require("dotenv").config();

let data = qs.stringify({
  'grant_type': 'client_credentials',
  'client_id': process.env.client_ID,
  'scope': process.env.scope,
  'client_secret': process.env.value 
});

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
    // 'Cookie': 'buid=0.AVMAFOfycy6jl0aUSd_-Hfil1XUlo1XtumdEtsisn1S68GDFAAA.AQABAAEAAAAtyolDObpQQ5VtlI4uGjEPFwbBNXhdZpx4UKELkLUs6qD2jyO3ecX1-_UATKqIg9xyeRq6Kn4YUwkExVw2zzL4qc_3NBFkbZmgPgDQjIqQkCYefbf0ShzoH0ideIraGOkgAA; fpc=AgTYw2HGJ9ZIjckFDI2MV9WlDUmzAQAAAA89i9wOAAAA; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd'
  },
  data : data
};
 
const token_controller = async function (req, res) {
  axios.request(config)
      .then(response => {
          console.log(response.data.access_token); 
          // Access the response data here
          res.status(200).send(response.data.access_token); // Send the response data back to the client if needed
      })
      .catch(error => {
          console.error(error);
          res.status(500).send('An error occurred'); // Handle errors appropriately
      });
}

module.exports = {token_controller}

