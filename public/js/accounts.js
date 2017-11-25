requirejs.config({
  baseUrl: 'js',
  paths : {
    'jquery': '../node_modules/jquery/dist/jquery.min',
    'handlebars': '../node_modules/handlebars/dist/handlebars.min'
  },
});

requirejs(['jquery', 'handlebars', 'config'], function ($, Handlebars, config) {
  Handlebars.registerHelper('currency', function(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
  });

  $(function () {
    console.log('start');

    let accountListTemplate = Handlebars.compile($('#account-list-template').html());

    $.getJSON('./api/accounts', function(data) {
      const accountList = data;

      accountList.forEach(function (account, index, array) {
        account.plus = account.total >= 0;
      });

      $('#account-list-container').html(accountListTemplate({'empty': (accountList.length == 0), 'accountList': accountList}));

      $('#account-list').delegate('tr', 'click', function (e) {
        location.replace(config.items_path + '?account=' + this.dataset.idx);
      });

      $('#account-list').delegate('tr', 'touchstart', function (e) {
        $(this).addClass('item-selected');
      });

      $('#account-list').delegate('tr', 'touchend', function (e) {
        $(this).removeClass('item-selected');
      });
    });
  })
});
