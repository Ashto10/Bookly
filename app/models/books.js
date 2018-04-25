'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Book = new Schema({
  title: String,
  author: String,
  coverImg: String,
  owner_id: String,
  tradeStatus: {
    isTradeable: String,
    borrower_id: String
  }
});

module.exports = mongoose.model('Book', Book);