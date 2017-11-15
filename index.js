var express = require('express');
var Rest = require('connect-rest');

var app = express();

// using handlebar as template engine
var handlebars = require('express-handlebars')
  .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 80);

var options = {
  context: '/api',
  logger:{ file: 'mochaTest.log', level: 'debug' },
	apiKeys: [ '849b7648-14b8-4154-9ef2-8d1dc4c2b7e9' ]
};
var rest = Rest.create(options);
app.use(rest.processRequest());

//rest.get('/test/:id', function(

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
