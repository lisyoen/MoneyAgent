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
  let edit_mode = (item_idx !== undefined);

  $(function () {
    console.log('start', account_idx, item_idx, edit_mode);

    let titleTemplate = Handlebars.compile($('#title-template').html());
    let itemTemplate = Handlebars.compile($('#item-template').html());

    if (edit_mode) {
      $('#title-container').html(titleTemplate({'title': 'Edit Item'}));
    } else {
      $('#title-container').html(titleTemplate({'title': 'Add Item'}));
    }

    $("#datetime").val(new Date().toJSON().slice(0,19));

    $('#cancel-button').on('click', function(e) {
      location.replace(config.items_path + '?account=' + account_idx);
    });

    $('#submit-button').on('click', function(e) {
      alert($('#datetime')[0].value);
    });

    if (edit_mode) {
      $.getJSON('./api/item/' + item_idx, function(data) {
        const item = data;
        item.edit = true;
        console.log(item);

        $('#item-container').html(itemTemplate(item));
      });
    }
  });
});
