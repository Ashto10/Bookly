'use strict';

(function() {
  
  $('.profile-controls').hide();
  $('input').hide();
  
  $('#enable-update').on('click', function() {
    $('.profile-controls').show();
    $('input').show();
    $('#enable-update').hide();
    $('.display-text').hide();
  });
  
  $('#cancel-update').on('click', function() {
    $('.profile-controls').hide();
    $('input').hide();
    $('#enable-update').show();
    $('.display-text').show();
  });
  
})()