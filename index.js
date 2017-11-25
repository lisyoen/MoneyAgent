let express = require('express');
let vhost = require('vhost');
let config = require('./config.js');

let app = express(); // Money Agent
let appHost = express();  // vhost app

// using handlebar as template engine
let handlebars = require('express-handlebars')
  .create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.set('port', config.service_port);

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(config.db_path, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to ' + config.db_path + ' database.');
});

app.get('/api/accounts', function(req, res) {
  db.serialize(() => {
    db.all(`SELECT *
            FROM vwAccounts ORDER BY sort ASC`,
            (err, rows) => {
      if (err) {
        console.error(err.message);
      }

      let result = [];
      rows.forEach(function (item, index, array) {
        result.push({
          idx: item.idx,
          name: item.name,
          count: item.count,
          total: item.total,
          sort: item.sort,
          date: item.date,
          icon: item.icon
        })
      });

      res.json(result);
    });
  });
});

app.get('/api/items/:account_idx', function(req, res) {
  // req.params.account_idx
  db.serialize(() => {
    db.all(`SELECT i.idx as idx, i.amount as amount, i.memo as memo, i.category_idx as category_idx,
            cat.name as category_name, i.class_idx as class_idx, cls.name as class_name, i.date as date
            FROM items i LEFT JOIN categories cat ON i.category_idx = cat.idx
            LEFT JOIN classes cls ON i.class_idx = cls.idx
            WHERE i.account_idx = ? ORDER BY i.date DESC`,
            [req.params.account_idx],
            (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows);
    });
  });
});

app.get('/api/item/:item_idx', function(req, res) {
  // req.params.item_idx
  db.serialize(() => {
    db.get(`SELECT *
            FROM items WHERE idx = ` + req.params.item_idx,
            (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows);
    });
  });
});

app.get('/api/categories', function(req, res) {
  db.serialize(() => {
    db.all(`SELECT *
            FROM categories`,
            (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows);
    });
  });
});

app.get('/api/classes', function(req, res) {
  db.serialize(() => {
    db.all(`SELECT *
            FROM classes`,
            (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      res.json(rows);
    });
  });
});

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

appHost.use(vhost(config.service_domain, app));

appHost.listen(app.get('port'), function() {
  console.log('Express started on http://' + config.service_domain + ':' +
    app.get('port') + '; press Ctrl-C to terminate.');
});

/*
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});
*/
