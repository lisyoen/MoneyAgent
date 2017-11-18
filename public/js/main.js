requirejs.config({
  baseUrl: 'js',
  paths : {
    'jquery': '../node_modules/jquery/dist/jquery.slim.min',
    'handlebars': '../node_modules/handlebars/dist/handlebars.min'
  },
});

requirejs(['jquery', 'handlebars'], function ($, Handlebars) {
  Handlebars.registerHelper('currency', function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  });

  $(function () {
    console.log('start');
    let accountListTemplate = Handlebars.compile($('#account-list-template').html());
    // sample data
    const accountList = [
      {"idx":139,"name":"11월 2017 용돈","count":2,"total":307000,"sort":1,"date":1509619036.663793,"icon":77},
      {"idx":138,"name":"11월 2017 생활비","count":1,"total":-12000,"sort":2,"date":1509619023.35982,"icon":77}
    ];

    for (let i in accountList) {
      let account = accountList[i];
      account.plus = account.total >= 0;
    }

    $('#account-list-container').html(accountListTemplate({'accountList': accountList}));

  })
});
