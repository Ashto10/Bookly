'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = new Schema({
  twitter: {
    id: String,
    displayName: String,
    iconURL: String
  },
  userData: {
    firstName: String,
    lastName: String,
    city: String,
    state: String
  },
  ownedBooks: [{
    book_id: String,
    title: String,
    author: String,
    coverImg: String
  }],
  borrowedBooks: [{
    book_id: String,
    title: String,
    author: String,
    coverImg: String,
    owner_id: String
  }]
});

module.exports = mongoose.model('User', User);