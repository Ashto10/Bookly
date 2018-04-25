'use strict';

const fetch = require('node-fetch');
const path = process.cwd();
var ServerFunctions = require(path + '/app/controllers/serverFunctions.js');

module.exports = function (app, passport, aWss) {
  const sf = new ServerFunctions();
  
  app.route('/')
    .get(sf.populateTemps, function(req, res, next) {
      res.render('index');
    });
  
  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
    });

  app.route('/auth/twitter')
    .get(passport.authenticate('twitter'));
  
  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter'), (req, res) => {
      res.redirect('/profile');
    });
  
  app.route('/profile')
    .get(sf.isLoggedIn, sf.populateTemps, (req, res) => {
      res.render('profile', res.locals);
    })
  
  app.route('/profile/modify')
    .post(sf.updateUserData, (req,res) => {
      res.redirect('/settings');
    })
  
  app.route('/collection/add')
    .post(sf.addBookToCollection);
  
  app.route('/books')
    .get(sf.isLoggedIn, sf.populateTemps, sf.getAllBooks, (req, res) => {
      res.render('books', res.locals);
    });
  
  app.route('/trade/open')
    .post(sf.initiateTradeRequest);
  
  app.route('/trade/status/:book_id')
    .get(sf.getTradeRequests)
  
  app.route('/trade/status')
    .post(sf.closeTradeRequest);
  
  app.route('/settings')
    .get(sf.populateTemps, (req, res) => {
      res.render('settings', res.locals);
    });
};