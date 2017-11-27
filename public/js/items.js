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

  let params = (new URL(document.location)).searchParams;
  let account_idx = params.get('account');

  $(function () {
    console.log('start');
    let itemListTemplate = Handlebars.compile($('#item-list-template').html());

    $('#back-button').on('click', function(e) {
      location.replace(config.accounts_path);
    });

    $('.refresh-button').on('click', function(e) {
      location.reload(true);
    });

    $('#add-button').on('click', function(e) {
      location.replace(config.item_path + '?account=' + account_idx);
    });

    $.getJSON('./api/items/' + account_idx, function(data) {
      const itemList = data;

      itemList.forEach(function (item, index, array) {
        item.plus = item.amount >= 0;
      });

      $('#item-list-container').html(itemListTemplate({'empty': (itemList.length == 0), 'itemList': itemList}));

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
