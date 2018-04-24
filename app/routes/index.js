'use strict';

const fetch = require('node-fetch');
const path = process.cwd();
var ServerFunctions = require(path + '/app/controllers/serverFunctions.js');

function populateTemporary(req, res, next) {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.user = req.user;
  next();
}

module.exports = function (app, passport, aWss) {
  function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
      res.locals.error = 'You need to be logged in to view that page!';
			res.render('index', res.locals);
		}
  }
  
  function isGuest (req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/profile');
		}
  }
  const sf = new ServerFunctions();
  
  app.route('/')
    .get(populateTemporary, function(req, res, next) {
      //TEMP!!!
      // res.render('index');
      res.redirect('/auth/twitter');
      //END TEMP
    });
  
  //TEMP!!!
  app.route('/index')
    .get(populateTemporary, function(req, res, next) {
        res.render('index');
      });
  //END TEMP
  
  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
    });

  app.route('/auth/twitter')
    .get((req,res, next) => {
      req.session.returnTo = req.headers.referer;
      next();
    }, passport.authenticate('twitter'));
  
  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter'), (req, res) => {
      //TEMP!!!
      res.redirect('/profile');
      // res.redirect(req.session.returnTo || '/');
      // delete req.session.returnTo;
      //END TEMP
    });
  
  app.route('/profile')
    .get(isLoggedIn, populateTemporary, (req, res) => {
      res.render('profile', res.locals);
    })
  
  app.route('/profile/modify')
    .post(sf.updateUserData, (req,res) => {
      res.redirect('/profile');
    })
  
  app.route('/collection/add')
    .post(sf.addBookToCollection);
  
  app.route('/books')
    .get(sf.getAllBooks, (req, res) => {
      res.render('books');
    });
  
  app.route('/trade/open/:book_id')
    .get(sf.initiateTradeRequest);
  
  app.route('/trade/status/:book_id')
    .get(sf.getTradeRequests)
  
  app.route('/trade/status')
    .post(sf.closeTradeRequest);
  
//   app.ws('/', function(ws, req) {
//     ws.on('connection', function() {
//       console.log('Connected');
//     });

//     ws.on('message', function(msg) {
//       msg = JSON.parse(msg);
      
//     });

//     ws.on('close', function (msg) {
//       console.log('Connection is closed!', msg);
//     });
  // });
};