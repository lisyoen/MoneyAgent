requirejs.config({
  baseUrl: 'js',
  paths : {
    'jquery': '../node_modules/jquery/dist/jquery.min',
    'handlebars': '../node_modules/handlebars/dist/handlebars.min'
  },
});

requirejs(['jquery', 'handlebars'], function ($, Handlebars) {
  Handlebars.registerHelper('currency', function(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
  });

  $(function () {
    console.log('start');
    let accountListTemplate = Handlebars.compile($('#account-list-template').html());

    $.getJSON('./api/vwAccounts', function(data) {
      const accountList = data;

      for (let i in accountList) {
        let account = accountList[i];
        account.plus = account.total >= 0;
      }

      $('#account-list-container').html(accountListTemplate({'accountList': accountList}));
    });
  })
});
