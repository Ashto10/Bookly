'use strict';

const User = require('../models/users.js');
const Book = require('../models/books.js');
const mongoose = require('mongoose');
const tradeState = require('../common/tradeState.js');

// in case of mistyped address, will keep mongoose from throwing a castType error
function validateId(id, callback) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return;
  } else {
    callback();
  }
}

function ServerFunctions() {
  this.populateTemps = (req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.user = req.user;
    next();
  }
  
  this.isLoggedIn =  (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		} else {
      res.locals.error = 'You need to be logged in to view that page!';
			res.render('index', res.locals);
		}
  }
  
  this.addBookToCollection = (req, res, next) => {
    let newEntry = req.body;
    Book.create({
      author: newEntry.author,
      title: newEntry.title,
      coverImg: newEntry.coverImg,
      owner_id: req.user._id,
      tradeStatus: {
        isTradeable: tradeState.free,
        borrower_id: ''
      }
    }, (bookError, book) => {
      if (bookError) { throw new Error(bookError); }
      
      User.findOneAndUpdate({_id: req.user._id}, {$push:{ownedBooks: {book_id: book._id, title: book.title, author: book.author, coverImg: book.coverImg}}}, (userError, user) => {
        if (userError) { throw new Error(userError); }
        return res.json({error: null, coverImg: book.coverImg});
      })
    });
  }
  
  this.updateUserData = (req, res, next) => {
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
    var book_id = req.body.book_id;
    Book.findById(book_id, (err, book) => {
      if (book.owner_id === req.user._id) { throw new Error('You can\'t borrow your own book!') }
      if(book.tradeStatus.isTradeable === tradeState.free) {
        
        book.tradeStatus = {
          isTradeable: tradeState.pending,
          borrower_id: req.user._id
        }
        book.save(err => {
          if (err) { throw err; }
          res.send({status: 'SUCCESS'});
        });
      } else {
        // Someone else borrowed the book first!
      }
    })
    
  }
  
  this.getTradeRequests = (req, res, next) => {
    var book_id = req.params.book_id;
    console.log(book_id);
    Book.findById(book_id, (err, book) => {
      if (err) { return res.json({error: err}) }
      console.log(book.tradeStatus.isTradeable);
      if (book.tradeStatus.isTradeable === tradeState.pending) {
        return res.json({tradeWanted: true, book: book});
      } else {
        return res.json({tradeWanted: false});
      }
    });
  }
  
  this.closeTradeRequest = (req, res, next) => {
    Book.findById(req.body.book_id, (bookErr, book) => {
      if (bookErr) { throw bookErr }
      
      
      if (req.body.action === 'LOAN'){
        var addedBook = {
          book_id: book._id,
          title: book.title,
          coverImg: book.coverImg,
          owner_id: book.owner_id
        }
        User.findOneAndUpdate({_id: book.tradeStatus.borrower_id},{$push: { borrowedBooks : addedBook }}, (userErr, user) => {
          if (userErr) { throw userErr }
          
          book.tradeStatus.isTradeable = tradeState.borrowed;
          book.tradeStatus.borrower_id = user._id;
          book.save(err => {
            if (err) { throw err }
            return res.json({denied: 'denied'});
          })
        });
      } else if (req.body.action === 'REJECT') {
        book.tradeStatus.isTradeable = tradeState.free;
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