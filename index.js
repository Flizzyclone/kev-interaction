const express = require('express');
const path = require('path');
const fs = require('fs');

const demographicsFunctions = require('./demographics');

const https = require('https');

const app = express();

// Routes
app.use('/interactions', require('./interactions'));

app.use(express.json());
app.use('/spreadsheet', require('./spreadsheet'));

// Listen both http & https ports
const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live//privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live//fullchain.pem'),
}, app);

httpsServer.listen(5001, () => {
    console.log('Running on port 5001');
});