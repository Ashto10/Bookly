'use strict';

const User = require('../models/users.js');
const Book = require('../models/books.js');
const mongoose = require('mongoose');

// in case of mistyped address, will keep mongoose from throwing a castType error
function validateId(id, callback) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return;
  } else {
    callback();
  }
}

function ServerFunctions() {
  this.addBookToCollection = (req, res, next) => {
    let newEntry = req.body;
    console.log(newEntry);
    Book.create({
      author: newEntry.author,
      title: newEntry.title,
      coverImg: newEntry.coverImg,
      owner_id: req.user._id,
      tradeStatus: {
        isTradeable: true,
        borrower_id: '',
        dateBorrowed: new Date()
      }
    }, (bookError, book) => {
      if (bookError) { throw new Error(bookError); }
      
      User.findOneAndUpdate(req.body.user_id, {$push:{ownedBooks: {book_id: book._id, title: book.title, coverImg: book.coverImg}}}, (userError, user) => {
        if (userError) { throw new Error(userError); }
        return res.json({error: null, title: book.title});
      })
    });
  }
  
  this.updateUserData = (req, res, next) => {
    console.log(req.body);
    let newData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      city: req.body.city,
      state: req.body.state,
    }
    
    User.findOneAndUpdate(req.body.user_id, {userData: newData}, (err, user) => {
      if(err) { throw new Error(err); }
      return next();
    });
  }
  
  this.getAllBooks = (req, res, next) => {
    Book.find({}, (err, books) => {
      res.locals.books = books;
      return next();
    });
  }
  
  this.initiateTradeRequest = (req, res, next) => {
    Book.findById(req.params.book_id, (err, book) => {
      if (book.owner_id === req.user._id) { throw new Error('You can\'t borrow your own book!') }
      if(book.tradeStatus.isTradeable) {
        book.tradeStatus = {
          isTradeable: false,
          borrower_id: req.user._id,
          dateBorrowed: new Date()
        }
        book.save(err => {
          if (err) { throw err; }
        });
      } else {
        // Someone else borrowed the book first!
      }
      res.redirect('back');
    })
    
  }
  
  this.getTradeRequests = (req, res, next) => {
    var book_id = req.params.book_id;
    Book.findById(book_id, (err, book) => {
      if (err) { return res.json({error: err}) }
      if (book.tradeStatus.isTradeable) {
        return res.json({tradeWanted: false});
      } else {
        return res.json({tradeWanted: true, book: book});
      }
    });
  }
  
  this.closeTradeRequest = (req, res, next) => {
    Book.findById(req.body.book_id, (bookErr, book) => {
      if (bookErr) { throw bookErr }
      
      
      if (req.body.action === 'LOAN'){
        var addedBook = {
          "book_id": book._id,
          "title": book.title,
          "coverImg": book.coverImg
        }
        User.findOneAndUpdate({_id: book.tradeStatus.borrower_id},{$push: { borrowedBooks : addedBook }}, (userErr, user) => {
          if (userErr) { throw userErr }
          
          return res.json({accepted: 'accepted'});
        });
      } else if (req.body.action === 'REJECT') {
        book.tradeStatus.isTradeable = true;
        book.tradeStatus.borrower_id = '';
        book.save(err => {
          if (err) { throw err }
          return res.json({denied: 'denied'});
        })
      }
    });
    
  }
}

module.exports = ServerFunctions;