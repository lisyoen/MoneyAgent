// js Date type : 1511825699353
// sqlite3 type : 1511825699.353
// html5 type : 2017-11-27T23:34
define([], function () {
  return {
    DateToSqlite3: function(date) {
      return (date.getTime() / 1000);
    },

    getSQLite3Now: function() {
      return Date.now() / 1000;
    },

    // not tested
    DateToHTML5: function(date) {
      let dateLocal = date.getTime() - (date.getTimezoneOffset() * 6000);
      let isoString = dateLocal.toISOString();
      return isoString.substring(0,isoString.length - 8);
    },

    SQLite3ToHTML5: function(date) {
      let dateLocal = new Date(date * 1000);
      dateLocal.setTime(dateLocal.getTime() - (dateLocal.getTimezoneOffset() * 1000 * 60));
      let isoString = dateLocal.toISOString();
      return isoString.substring(0,isoString.length - 8);
    },

    SQLite3ToDateString: function(date) {
      let dateLocal = new Date(date * 1000);
      dateLocal.setTime(dateLocal.getTime() - (dateLocal.getTimezoneOffset() * 1000 * 60));
      let dateString = dateLocal.getUTCFullYear() + '.' + (dateLocal.getUTCMonth() + 1) + '.' + dateLocal.getUTCDate();
      return dateString;
    }
  };
});
