requirejs.config({
  baseUrl: 'js',
  paths : {
    'jquery': '../node_modules/jquery/dist/jquery.min',
    'handlebars': '../node_modules/handlebars/dist/handlebars.min',
    'date-convert': './date-convert'
  },
});

requirejs(['jquery', 'handlebars', 'config', 'date-convert'],
  function ($, Handlebars, config, dc) {
  Handlebars.registerHelper('currency', function(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
  });

  let params = (new URL(document.location)).searchParams;
  let account_idx = params.get('account');

  $(function () {
    console.log('start');
    let titleTemplate = Handlebars.compile($('#title-template').html());
    let itemListTemplate = Handlebars.compile($('#item-list-template').html());

    $('.back-button').on('click', function(e) {
      location.replace(config.accounts_path);
    });

    $('#refresh-button').on('click', function(e) {
      location.reload(true);
    });

    $('#add-button').on('click', function(e) {
      location.replace(config.item_path + '?account=' + account_idx);
    });

    $.getJSON('./api/items/' + account_idx, function(data) {
      const account = data.account;
      const itemList = data.itemList;

      $('#title-container').html(titleTemplate({'title': account.name}));

      itemList.forEach(function (item, index, array) {
        item.plus = item.amount >= 0;
        item.date_string = dc.SQLite3ToDateString(item.date);
      });

      data.empty = (itemList.length == 0);

      $('#item-list-container').html(itemListTemplate(data));

      $('#item-list').delegate('tr', 'click', function (e) {
        location.replace(config.item_path + '?account=' + account_idx +'&item=' + this.dataset.idx);
      });

      $('#item-list').delegate('tr', 'touchstart', function (e) {
        $(this).addClass('item-selected');
      });

      $('#item-list').delegate('tr', 'touchend', function (e) {
        $(this).removeClass('item-selected');
      });
    });
  })
});
