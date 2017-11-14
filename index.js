var express = require('express');
var rest = require('connect-rest');

var app = express();

// using handlebar as template engine
var handlebars = require('express-handlebars')
  .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 80);



app.use(function(req, res){
  res.type('text/plane');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.type('text/plane');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' +
  app.get('port') + '; press Ctrl-C to terminate.');
});

/*
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/md.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the md database.');
});

db.serialize(() => {
  db.each(`SELECT *
           FROM accounts`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.idx + "\t" + row.name);
  });
});

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});
*/
