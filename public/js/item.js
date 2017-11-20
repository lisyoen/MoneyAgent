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

  let params = (new URL(document.location)).searchParams;
  let account_idx = params.get("account");

  $(function () {
    console.log('start');
    let itemListTemplate = Handlebars.compile($('#item-list-template').html());

    $.getJSON('./api/items/' + account_idx, function(data) {
      const itemList = data;

      for (let i in itemList) {
        let account = itemList[i];
        account.plus = account.total >= 0;
      }

      $('#item-list-container').html(itemListTemplate({'itemList': itemList}));
    });
  })
});
