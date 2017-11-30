requirejs.config({
  baseUrl: 'js',
  paths: {
    'jquery': '../node_modules/jquery/dist/jquery.min',
    'handlebars': '../node_modules/handlebars/dist/handlebars.min',
    'date-convert': './date-convert'
  },
});

requirejs(['jquery', 'handlebars', 'config', 'date-convert'],
  function($, Handlebars, config, dc) {
    Handlebars.registerHelper('currency', function(num) {
      return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
    });

    let params = (new URL(document.location)).searchParams;
    let account_idx = params.get('account');
    let item_idx = params.get('item');
    let edit_mode = (item_idx !== null);

    $(function() {
      console.log('start', account_idx, item_idx, edit_mode);

      renderView();
      bindEvent();
    });

    function renderView() {
      let titleTemplate = Handlebars.compile($('#title-template').html());
      let itemTemplate = Handlebars.compile($('#item-template').html());
      let categoryItemTemplate = Handlebars.compile($('#category-item-template').html());
      let classItemTemplate = Handlebars.compile($('#class-item-template').html());

      if (edit_mode) {
        $('#title-container').html(titleTemplate({
          'title': 'Edit Item'
        }));
      } else {
        $('#title-container').html(titleTemplate({
          'title': 'Add Item'
        }));
      }

      $("#datetime").val(new Date().toJSON().slice(0, 19));

      if (edit_mode) {
        console.log('edit mode');
        $.getJSON('./api/item/' + item_idx, function(data) {
          const item = data;
          item.edit = true;
          item.date_string = dc.SQLite3ToHTML5(item.date);
          console.log(item);

          $('#item-container').html(itemTemplate(item));
          bindLazyEvent();
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
        bindLazyEvent();
      }

      $.getJSON('./api/categories', function(data) {
        let categories = [];

        data.forEach(function(e, i, a) {
          categories[e.idx] = e;
        });

        function compare(a, b, sign) {
          if (a > b) return sign;
          if (a < b) return -sign;
          return 0;
        }

        categories.forEach(function(e, i, a) {
          if (e.parent > 0) {
            e.sortname = a[e.parent].name + '-' + e.name;
          } else {
            e.sortname = e.name;
          }
        });

        categories.sort(function(a, b) {
          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;

          let c;
          if ((c = compare(a.type, b.type, -1)) == 0) {
            return compare(a.sortname, b.sortname, 1);
          } else {
            return c;
          }
        });

        $('#category-list').html(categoryItemTemplate({
          'categoryList': categories
        }));
      });

      $.getJSON('./api/classes', function(data) {
        let classes = data;
        $('#class-list').html(classItemTemplate({
          'classList': classes
        }));
      });
    }

    function bindEvent() {
      $('#refresh-button').on('click', function(e) {
        location.reload(true);
      });

      $('.cancel-button').on('click', function(e) {
        location.replace(config.items_path + '?account=' + account_idx);
      });

      $('#submit-button').on('click', function(e) {
        alert($('#datetime')[0].value);
      });
    }

    function bindLazyEvent() {
      $('#category-list').delegate('div.list-group-item', 'click', function(e) {
        let category = $('#category')[0];
        let item = $(this)[0];
        category.dataset.category_idx = item.dataset.idx;
        category.value = item.dataset.name;
        $('#category').click();
      });

      $('#category-list').delegate('div.list-group-item', 'touchstart', function(e) {
        console.log('touch');
        $(this).addClass('item-selected');
      });

      $('#category-list').delegate('div.list-group-item', 'touchend', function(e) {
        $(this).removeClass('item-selected');
      });

      $('#class-list').delegate('div.list-group-item', 'click', function(e) {
        let cls = $('#class')[0];
        let item = $(this)[0];
        cls.dataset.class_idx = item.dataset.idx;
        cls.value = item.dataset.name;
        $('#class').click();
      });

      $('#class-list').delegate('div.list-group-item', 'touchstart', function(e) {
        $(this).addClass('item-selected');
      });

      $('#class-list').delegate('div.list-group-item', 'touchend', function(e) {
        $(this).removeClass('item-selected');
      });
    }

});
