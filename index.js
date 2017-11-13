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
