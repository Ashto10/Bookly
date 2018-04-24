'use strict';

var appUrl = window.location.origin;

var ajaxFunctions = {
   ready: function ready (fn) {
      if (typeof fn !== 'function') {
         return;
      }

      if (document.readyState === 'complete') {
         return fn();
      }

      document.addEventListener('DOMContentLoaded', fn, false);
   },
   ajaxRequest: function ajaxRequest (method, url, callback, headerContent) {
     var xmlhttp = new XMLHttpRequest();

     xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
           callback(xmlhttp.response);
        }
     };

     xmlhttp.open(method, url, true);
     
     if (headerContent !== undefined) {
       xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
     } else {
       headerContent = '';
     }

     xmlhttp.send(headerContent);
   }, 
  encode: function encode(key, value) {
    return encodeURIComponent(key) + "=" + encodeURIComponent(value);
  }
};