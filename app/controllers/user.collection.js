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
          coverImg: book.cover_i !== undefined ? 'https://covers.openlibrary.org/b/id/' + book.cover_i + '-M.jpg' : 'https://www.placehold.it/180x234'
        });
        
        $('#title-list').append(
          $('<div/>', {class: 'book-container', 'data-select': i})
          .append(
            $('<h1/>', {class: 'book-title', text: bookSelection[i].title})
          ).append(
            $('<h2/>', {class: 'book-author', text: bookSelection[i].author})
          ).append(
            $('<img />').attr('src', bookSelection[i].coverImg)
          )
        );
      }
    }));
  }
  
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
      if(res.error) {
        $('.error-container').text('An error has occured, try again later');
        return;
      }
      $(".error-container").text('Success! ' + res.title + ' has been added to your collection.');
      $('#title-list').html('');
      $('#title').html('');
    }, req));
  });
  
//   var ws = new WebSocket('wss://bookly.glitch.me/');
//   var heartbeat;
  
//   function sendMessage(msg) {
//     ws.send(JSON.stringify(msg));
//   }

//   ws.onopen = function () {    
//     sendMessage({command: 'STARTUP'});
    
//     heartbeat = setInterval(function() {
//       sendMessage({command: 'PING'});
//     }, 10000);

//   }

//   ws.onmessage = function (ev) {
  
//   }
  
//   window.onbeforeunload = function() {
//     ws.onclose = function () {}; // disable onclose handler first
//     clearInterval(heartbeat);
//     ws.close()
//   };
  
})()