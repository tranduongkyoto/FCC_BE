// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  console.log(req);
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

//First Timestamp Endpoint
app.get('/api', (req, res) => {
  res.json({
    unix: new Date().getTime(),
    utc: new Date().toUTCString(),
  });
});

//Second Timestamp Endpoint
app.get('/api/:date', (req, res) => {
  let dateParam = req.params.date;
  console.log(dateParam);
  let dateConverted = new Date(dateParam);
  let unixRegex = /\d{5,}/;
  console.log(dateConverted);
  if (unixRegex.test(dateParam)) {
    console.log('first');
    return res.json({
      unix: parseInt(dateParam),
      utc: new Date(parseInt(dateParam)).toUTCString(),
    });
  } else {
    console.log('second');
    return res.json({
      unix: dateConverted.getTime(),
      utc: dateConverted.toUTCString(),
    });
  }
});
// listen for requests :)
var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
