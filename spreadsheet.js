const { json } = require('body-parser');
const { request, response } = require('express');
const express = require('express');
const axios = require('axios')
const router = express.Router();
const botFunc = require('./botfunctions');

const key = '';

router.post('/anonconcern', async (req, res) => {
  console.log(req.body)
  if (req.headers.authorization != `Basic ${key}`) {
    res.status(403).json({ error: 'Invalid Authorization'});
    return;
  }
  botFunc.postConcern(req.body);
  res.sendStatus(200);
});


router.post('/anonvent', async (req, res) => {
  console.log(req.body)
  if (req.headers.authorization != `Basic ${key}`) {
    res.status(403).json({ error: 'Invalid Authorization'});
    return;
  }
  botFunc.postVent(req.body);
  res.sendStatus(200);
});

router.post('/anonsuggestion', async (req, res) => {
  console.log(req.body)
  if (req.headers.authorization != `Basic ${key}`) {
    res.status(403).json({ error: 'Invalid Authorization'});
    return;
  }
  botFunc.postSuggestion(req.body);
  res.sendStatus(200);
});

router.post('/verification', async (req, res) => {
  console.log(req.body)
  if (req.headers.authorization != `Basic ${key}`) {
    res.status(403).json({ error: 'Invalid Authorization'});
    return;
  }
  botFunc.postVerif(req.body);
  res.sendStatus(200);
});

module.exports = router;