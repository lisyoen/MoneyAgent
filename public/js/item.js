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
  let item_idx = params.get('item');
  let edit_mode = (item_idx !== null);

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
      console.log('edit mode');
      $.getJSON('./api/item/' + item_idx, function(data) {
        const item = data;
        item.edit = true;
        item.date_string = dc.SQLite3ToHTML5(item.date);
        console.log(item);

        $('#item-container').html(itemTemplate(item));
      });
    } else {
      console.log('add mode');
      const item = {
        idx: 0,
        date: dc.getSQLite3Now(),
        date_string: undefined,
        amount: 0,
        category_idx: 0,
        category_name: undefined,
        class_idx: 0,
        class_name: undefined,
        memo: undefined
      }
      item.date_string = dc.SQLite3ToHTML5(item.date);
      $('#item-container').html(itemTemplate(item));
    }
  });
});
