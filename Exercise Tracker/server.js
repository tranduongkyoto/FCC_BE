const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

var mongoose = require('mongoose');
try {
  // mongoose.connect(process.env.MONGO_URI, {
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
  //   useUnifiedTopology: true,
  // });
} catch (e) {
  console.log('====== connection Error =======');
  console.log(e);
}
const { Schema } = mongoose;
let exerciseSessionSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date,
});

let userSchema = new Schema({
  username: { type: String, required: true },
  count: Number,
  log: [exerciseSessionSchema],
});

let Users = new mongoose.model('Users', userSchema);
let ExerciseSession = new mongoose.model(
  'ExerciseSessions',
  exerciseSessionSchema
);

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/users', function (req, res) {
  let newUser = new Users({ username: req.body.username, count: 0 });
  newUser.save((err, saveData) => {
    if (err || !saveData) {
      res.json('The User Do not Save.');
    } else {
      res.json({
        username: saveData.username,
        _id: saveData._id,
      });
    }
  });
});

app.get('/api/users', function (req, res) {
  Users.find({}, (err, ArrayOfUsers) => {
    if (!err) {
      let resObj = ArrayOfUsers.map((l) => ({
        _id: l._id,
        username: l.username,
      }));
      res.json(resObj);
    }
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id;
  const { description, duration, date } = req.body;
  if (!date || date == '') {
    date = new Date().toISOString().substring(0, 10);
  }

  const newExerc = new ExerciseSession({
    description,
    duration,
    date: new Date(date),
  });

  Users.findByIdAndUpdate(
    id,
    { $inc: { count: 1 }, $push: { log: newExerc } },
    (err, resultData) => {
      if (err || !resultData) {
        res.send('User not Found.');
      } else {
        let resObj = {
          username: resultData.username,
          description: resultData.log[0].description,
          duration: Number(resultData.log[0].duration),
          date: resultData.log[0].date.toDateString(),
          _id: resultData._id,
        };

        res.json(resObj);
      }
    }
  );
});

app.get('/api/users/:id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  let userQry = {};
  userQry = req.params;

  let log = {};
  let dateObj = {};
  if (from) {
    dateObj['$gte'] = new Date(from);
  }
  if (to) {
    dateObj['$lte'] = new Date(to);
  }
  if (from || to) {
    log.date = dateObj;
  }
  userQry['log'] = log;

  let noNullLimit = 0;
  if (limit) {
    noNullLimit = limit;
  }
  console.log(userQry);
  Users.find(userQry, (err, resultUser) => {
    if (err || !resultUser) {
      res.send('User not Found.');
    } else {
      var userObj = {};

      userObj.username = resultUser.username;
      userObj.count = resultUser.count;
      userObj._id = resultUser._id;
      userObj.log = resultUser.log;
      res.json(userObj);
      /*

      ExerciseSession.find(filterObj)
        .limit(+noNullLimit)
        .exec((error, resultLog) => {
          if (err || !resultLog) {
            res.json({
              _id: id,
              username: resultUser.username,
              count: Number("0"),
              log: []
            });
          } else {
            userObj.count = Number(resultLog.length);

            userObj.log = [];
            const rawLog = resultLog;
            userObj.log = rawLog.map(l => ({
              description: l.description,
              duration: l.duration,
              date: l.date.toDateString()
            }));

            res.json(userObj);
            //return userObj;
            //res.json({_id : resultUser._id , username : resultUser.username, count : parseInt( resultLog.length) });
          }
        });
*/
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
