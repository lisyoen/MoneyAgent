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
  let item_idx = params.get('item');

  $(function () {
    console.log('start');

    let titleTemplate = Handlebars.compile($('#title-template').html());

    $('#title-container').html(titleTemplate({'title': 'New Item'}));

    $('#back-button').on('click', function(e) {
      location.replace(config.items_path + '?account=' + account_idx);
    });

  });
});
