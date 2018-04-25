'use strict';

(function() {
  
  $(document).on('click', '.book-trade-icon', function () {
    var button = $(this)
    var req = ajaxFunctions.encode('book_id', button.attr('data-book-id'));
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', '/trade/open', function(res) {
      res = JSON.parse(res);
      if (res.status === 'SUCCESS') {
        console.log('success');
        button.remove();
      }
    }, req));
  });
  
})()