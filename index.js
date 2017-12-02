let express = require('express');
let vhost = require('vhost');
let config = require('./config.js');
let bodyParser = require('body-parser');

let app = express(); // Money Agent
let appHost = express(); // vhost app

// using handlebar as template engine
let handlebars = require('express-handlebars')
  .create({
    defaultLayout: 'main'
  });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
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
    db.all(`SELECT idx, name, count, total, sort, date, icon
            FROM vwAccounts ORDER BY sort ASC`,
      (err, rows) => {
        if (err) {
          console.error(err.message);
        }

        res.json(rows);
      });
  });
});

app.get('/api/items/:account_idx', function(req, res) {
  // req.params.account_idx
  db.serialize(() => {
    let result = {};
    db.get(`SELECT idx, name, sort, date, icon
            FROM accounts WHERE idx = ?`, [req.params.account_idx],
      (err, row) => {
        if (err) {
          console.error(err.message);
        }
        result.account = row;
      });

    db.all(`SELECT i.idx AS idx, i.amount AS amount, i.memo AS memo, i.category_idx AS category_idx,
            cat.name AS category_name, i.class_idx AS class_idx, cls.name AS class_name, i.date AS date
            FROM items i LEFT JOIN categories cat ON i.category_idx = cat.idx
            LEFT JOIN classes cls ON i.class_idx = cls.idx
            WHERE i.account_idx = ? ORDER BY i.date DESC`, [req.params.account_idx],
      (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        result.itemList = rows;
        res.json(result);
      });
  });
});

app.get('/api/item/:item_idx', function(req, res) {
  // req.params.item_idx
  db.serialize(() => {
    db.get(`SELECT i.idx AS idx, i.amount AS amount, i.memo AS memo, i.'date' AS 'date',
	          i.category_idx AS category_idx, cat.name AS category_name,
            i.class_idx AS class_idx, cls.name AS class_name
            FROM items i LEFT JOIN categories cat ON i.category_idx = cat.idx
            LEFT JOIN classes cls ON i.class_idx = cls.idx
            WHERE i.idx = ?`, [req.params.item_idx],
      (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        res.json(rows);
      });
  });
});

app.post('/api/item', function(req, res) {
  console.log(req.body);
  db.serialize(() => {
    db.run(`INSERT INTO items (account_idx, 'date', category_idx, amount, class_idx, memo)
            VALUES (?, ?, ?, ?, ?, ?)`, [req.body.account_idx, req.body.date, req.body.category_idx,
        req.body.amount, req.body.class_idx, req.body.memo
      ],
      (err, rows) => {
        if (err) {
          console.error(err);
          res.json({
            code: err.code,
            message: err.message
          });
        }
        res.json({
          code: 0,
          message: 'success'
        });
      });
  });
});

app.get('/api/categories', function(req, res) {
  db.serialize(() => {
    db.all(`SELECT idx, name, parent, type, default_amount, icon FROM categories`,
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
    db.all(`SELECT idx, name FROM classes`,
      (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        res.json(rows);
      });
  });
});

app.use(function(req, res) {
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
