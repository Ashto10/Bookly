'use strict';

(function() {
  
  var bookSelection;
  
  function lookUpBook(title) {
    $('#title-list').html('');
    bookSelection = [];
    title = title.replace(/\s+/g, '+');
    var url = 'https://openlibrary.org/search.json?title=' + title;
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', url, function(data) {
      var results = JSON.parse(data);
      
      for(var i=0; i < 10; i++ ) {
        var book = results.docs[i]
        
        if (book === undefined) { break; }
        
        bookSelection.push({
          title: book.title,
          author: book.author_name,
          coverImg: book.cover_i !== undefined ? 'https://covers.openlibrary.org/b/id/' + book.cover_i + '-M.jpg' : 'https://www.placehold.it/180x276'
        });
        
        $('#title-list').append(
          $('<div/>', {class: 'book-container align-top', 'data-select': i})
          .append(
            $('<img/>', {class: 'book-cover', src: bookSelection[i].coverImg})
          ).append(
            $('<p/>', {class: 'book-title', text: bookSelection[i].title})
          ).append(
            $('<p/>', {class: 'book-author', text: bookSelection[i].author})
          )
        );
      }
    }));
  }
  
  function updateTradeStatus(element, accept) {
    
    var req = [];
    req.push(ajaxFunctions.encode('book_id', element.parent().attr('data-book-id')));
    req.push(ajaxFunctions.encode('action', accept));
    req = req.join('&').replace(/%20/g, '+');    
    
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', '/trade/status', function(res) {
      element.closest('.trade-container').remove();
    }, req));
  }
  
  $('#collection .book-container').each(function(book) {
    var book_id = $(this).attr('data-collection-id');
    console.log(book_id);
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/trade/status/' + book_id, function(res) {
      var data = JSON.parse(res);
      if (data.tradeWanted) {
        var book = data.book;
        $('#trades').append(
          $('<div>', {class: 'trade-container'}).append(
            $('<span>').text('Someone wants to borrow ' + book.title)
          ).append(
            $('<div>', {class: 'controls', 'data-book-id': book._id}).append(
                $('<a>', {class: 'btn btn-success', href: '#'}).text('Accept').on('click', function() {
                  updateTradeStatus($(this), 'LOAN');
                })
              ).append(
                $('<a>', {class: 'btn btn-danger', href: '#'}).text('Reject').on('click', function() {
                  updateTradeStatus($(this), 'REJECT');
                })
              )
          )
        );
      }
    }));
  })
  
  $('#title-search').on('click', function() {
    var input = $('#title');
    lookUpBook(input.val());
    input.val('');
  });
  
  $('#title-list').on('click', '.book-container', function() {
    $('.book-container').removeClass('selected');
    $(this).addClass('selected');
  })
  
  $('#submit-book').on('click', function() {
    var selected = $('.book-container.selected').attr('data-select');
    if (selected === undefined) { return; }
    
    var req = [];
    var book = bookSelection[selected]
    Object.keys(book).forEach(function (key) {
      req.push(ajaxFunctions.encode(key, book[key]))
    });

    req = req.join('&').replace(/%20/g, '+');
    
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('POST', '/collection/add', function(res) {
      res = JSON.parse(res);
      
      $('#collection').append(
        $('<div>', {class: 'book-container'}).append(
          $('<img>', {class: 'book-cover'}).attr('src', res.coverImg)
        )
      )
      
      $('#title-list').html('');
      $('#title').html('');
    }, req));
  });
})()