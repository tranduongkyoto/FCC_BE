var express = require('express');
var cors = require('cors');
require('dotenv').config();

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});

let multer = require('multer');

app.post('/api/fileanalyse', multer().single('upfile'), (request, response) => {
  console.log(request.file);
  let responseObject = {};
  responseObject['name'] = request.file.originalname;
  responseObject['type'] = request.file.mimetype;
  responseObject['size'] = request.file.size;
  response.json(responseObject);
});
