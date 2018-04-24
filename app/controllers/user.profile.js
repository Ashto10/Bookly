'use strict';

(function() {
  
  
  function updateTradeStatus(book_id, accept) {
    
    var req = [];
    req.push(ajaxFunctions.encode('book_id', book_id));
    req.push(ajaxFunctions.encode('action', accept));
    req = req.join('&').replace(/%20/g, '+');    
    
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', '/trade/status', function(res) {
      
    }, req));
  }
  
  $('.book').each(function(book) {
    var book_id = $(this).attr('data-collection-id');
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/trade/status/' + book_id, function(res) {
      var data = JSON.parse(res);
      if (data.tradeWanted) {
        var book = data.book;
        $('#trades').append(
          $('<div>', {class: 'trade-container'}).append(
            $('<span>').text('Someone wants to borrow ' + book.title)
          ).append(
            $('<div>', {class: 'controls'}).append(
                $('<a>', {class: 'button', href: '#'}).text('Accept').on('click', function() {
                  updateTradeStatus(book._id, 'LOAN');
                })
              ).append(
                $('<a>', {class: 'button', href: '#'}).text('Reject').on('click', function() {
                  updateTradeStatus(book._id, 'REJECT');
                })
              )
          )
        );
      }
    }));
  })
})()