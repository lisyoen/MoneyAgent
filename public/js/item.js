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

    $('#title-container').html(titleTemplate({'title': 'Edit Item'}));

    $("#datetime").val(new Date().toJSON().slice(0,19));

    $('#cancel-button').on('click', function(e) {
      location.replace(config.items_path + '?account=' + account_idx);
    });

    $('#submit-button').on('click', function(e) {
      alert($('#datetime')[0].value);
    });

    $.getJSON('./api/item/' + item_idx, function(data) {
      const item = data;
      console.log(item);

    });
  });
});
