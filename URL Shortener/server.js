'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
require('dotenv').config();
var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db!! **/
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use('', bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  return res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

const url = require('url');
const dns = require('dns');

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true },
});

var Url = mongoose.model('Url', urlSchema);

app.post('/api/shorturl/new', function (req, res) {
  let original_url = req.body.url;
  let short_url = '';

  dns.lookup(
    new URL(
      !/^(?:f|ht)tps?\:\/\//.test(original_url)
        ? 'http://' + original_url
        : original_url
    ).hostname,
    (err, address, family) => {
      if (address !== undefined) {
        Url.findOne({ original_url: original_url }, function (err, data) {
          if (!err && data === null) {
            short_url = Math.random().toString(36).substring(2); // Random string

            let newUrl = new Url({
              original_url: original_url,
              short_url: short_url,
            });

            newUrl.save();
          } else {
            // original_url = data['original_url'];
            short_url = data['short_url'];
          }

          return res.json({ original_url: original_url, short_url: short_url });
        });
      } else {
        return res.json({ error: 'invalid URL' });
      }
    }
  );
});

app.get('/api/shorturl/:shorturl', function (req, res) {
  let short_url = req.params.shorturl;

  Url.findOne({ short_url: short_url }, function (err, data) {
    if (!err && data !== null) {
      return res.redirect(data['original_url']);
    } else {
      return res.json({ error: 'invalid short URL' });
    }
  });
});
