requirejs.config({
  baseUrl: 'js',
  paths: {
    'jquery': '../node_modules/jquery/dist/jquery.min',
    'handlebars': '../node_modules/handlebars/dist/handlebars.min',
    'date-convert': './date-convert'
  },
});

requirejs(['jquery', 'handlebars', 'config', 'date-convert'],
  function ($, Handlebars, config, dc) {
    Handlebars.registerHelper('currency', function (num) {
      return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
    });

    let params = (new URL(document.location)).searchParams;
    let account_idx = params.get('account');
    let item_idx = params.get('item');
    let edit_mode = (item_idx !== null);

    $(function () {
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

      $('#datetime').val(new Date().toJSON().slice(0, 19));

      if (edit_mode) {
        console.log('edit mode');
        $.getJSON('./api/item/' + item_idx, function (data) {
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

      $.getJSON('./api/categories', function (data) {
        let categories = [];

        data.forEach(function (e, i, a) {
          categories[e.idx] = e;
        });

        function compare(a, b, sign) {
          if (a > b) return sign;
          if (a < b) return -sign;
          return 0;
        }

        categories.forEach(function (e, i, a) {
          if (e.parent > 0) {
            e.sortname = a[e.parent].name + '-' + e.name;
          } else {
            e.sortname = e.name;
          }
        });

        categories.sort(function (a, b) {
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

      $.getJSON('./api/classes', function (data) {
        let classes = data;
        $('#class-list').html(classItemTemplate({
          'classList': classes
        }));
      });
    }

    $.postJSON = function (url, data, func) {
      $.post(url, data, func, 'json');
    };

    $.deleteJSON = function (url, func) {
      $.ajax({
        type: "DELETE",
        url: url,
        success: func,
        dataType: 'json'
      });
    };

    $.putJSON = function (url, data, func) {
      $.ajax({
        type: "PUT",
        url: url,
        data: data,
        success: func,
        dataType: 'json'
      });
    };

    function getItem() {
      let item = {
        account_idx: account_idx,
        category_idx: $('#category')[0].dataset.categoryidx,
        date: dc.HTML5ToSqlite3($('#datetime')[0].value),
        amount: $('#amount')[0].value * ($('#category')[0].dataset.categorytype == 0 ? -1 : 1),
        class_idx: $('#class')[0].dataset.classidx,
        memo: $('#memo')[0].value
      };
      if (!item.class_idx) {
        item.class_idx = 0;
      }
      return item;
    }

    function bindEvent() {
      $('#refresh-button').on('click', function (e) {
        location.reload(true);
      });

      $('.cancel-button').on('click', function (e) {
        location.replace(config.items_path + '?account=' + account_idx);
      });

      $('#amount').on('focusin', function (e) {
        if (parseInt(this.value) == 0) {
          this.value = '';
        }
      });

      $('#amount').on('focusout', function (e) {
        if (!$.isNumeric(this.value)) {
          this.value = '0';
        }
      });

      $('#add-button').on('click', function (e) {
        //console.log(getItem());
        if (edit_mode) {
          $.putJSON('./api/item/' + item_idx, getItem(), function (err) {
            console.log(err);
            location.replace(config.items_path + '?account=' + account_idx);
          });
        } else {
          $.postJSON('./api/item', getItem(), function (err) {
            console.log(err);
            location.replace(config.items_path + '?account=' + account_idx);
          });
        }
      });
    }

    function bindLazyEvent() {
      $('#category-list').delegate('div.list-group-item', 'click', function (e) {
        let category = $('#category')[0];
        let item = $(this)[0];
        category.dataset.categoryidx = item.dataset.idx;
        category.dataset.categorytype = item.dataset.type;
        category.value = item.dataset.name;
        $('#category').click();
      });

      $('#category-list').delegate('div.list-group-item', 'touchstart', function (e) {
        console.log('touch');
        $(this).addClass('item-selected');
      });

      $('#category-list').delegate('div.list-group-item', 'touchend', function (e) {
        $(this).removeClass('item-selected');
      });

      $('#class-list').delegate('div.list-group-item', 'click', function (e) {
        let cls = $('#class')[0];
        let item = $(this)[0];
        cls.dataset.classidx = item.dataset.idx;
        cls.value = item.dataset.name;
        $('#class').click();
      });

      $('#class-list').delegate('div.list-group-item', 'touchstart', function (e) {
        $(this).addClass('item-selected');
      });

      $('#class-list').delegate('div.list-group-item', 'touchend', function (e) {
        $(this).removeClass('item-selected');
      });

      $('#delete-ok-button').on('click', function (e) {
        $.deleteJSON('./api/item/' + item_idx, function (err) {
          console.log(err);
          location.replace(config.items_path + '?account=' + account_idx);
        });
      });
    }

  });
