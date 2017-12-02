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
      return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
    });

    let params = (new URL(document.location)).searchParams;
    let account_idx = params.get('account');
    let edit_mode = (account_idx !== null);

    $(function() {
      console.log('start', edit_mode);

      renderView();
      bindEvent();
    });

    function renderView() {
      let titleTemplate = Handlebars.compile($('#title-template').html());
      let accountTemplate = Handlebars.compile($('#account-template').html());

      if (edit_mode) {
        $('#title-container').html(titleTemplate({
          'title': 'Edit Account'
        }));
      } else {
        $('#title-container').html(titleTemplate({
          'title': 'Add Account'
        }));
      }

      if (edit_mode) {
        console.log('edit mode is not implemented yet.');
        /*
        $.getJSON('./api/account/' + account_idx, function(data) {
          const account = data;
          account.edit = true;
          account.name = '';
          console.log(account);

          $('#account-container').html(accountTemplate(account));
          bindLazyEvent();
        });
        */
      } else {
        console.log('add mode');
        const account = {
          name: (new Date).getFullYear().toString() + '-' + ((new Date).getMonth() + 1),
          icon: 1
        }
        $('#account-container').html(accountTemplate(account));
        bindLazyEvent();
      }
    }

    $.postJSON = function(url, data, func) {
      $.post(url, data, func, 'json');
    };

    function getAccount() {
      let account = {
        name: $('#name')[0].value,
        icon: 1
      };
      return account;
    }

    function bindEvent() {
      $('#refresh-button').on('click', function(e) {
        location.reload(true);
      });

      $('.cancel-button').on('click', function(e) {
        location.replace(config.accounts_path);
      });

      $('#add-button').on('click', function(e) {
        $.postJSON('./api/account', getAccount(), function(err) {
          console.log(err);
          location.replace(config.accounts_path);
        });
      });
    }

    function bindLazyEvent() {

    }
  });
