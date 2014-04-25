var express = require('express');
var connect = require('connect');
var googleapis = require('googleapis');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes');
var util = require('util');

var inbox = require("inbox");

// Create a new project from the Google Developer Console. https://console.developers.google.com/project
// Enter: "urn:ietf:wg:oauth:2.0:oob" as the callback url.
// and change the client id and secret below
var CLIENT_ID = 'some_client_id_asdfasdfasd.apps.googleusercontent.com';
var CLIENT_SECRET = 'client1234secret';
var REDIRECT_URL = 'urn:ietf:wg:oauth:2.0:oob';

// Then set the username and password for the imap account (that will recieve the invite request).
var IMAP_EMAIL = 'someemail@gmail.com';
var IMAP_PASSWORD = 'somepassword';

var mail_client = inbox.createConnection(false, "imap.gmail.com", {
    secureConnection: true,
    auth:{
        user: IMAP_EMAIL,
        pass: IMAP_PASSWORD
    }
});

var OAuth2Client = googleapis.OAuth2Client;

app = express();
app.oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.set('oauth2Client', oauth2Client);


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

sessionStore = new connect.session.MemoryStore();
SITE_SECRET = 'asdfasKLAJHFasdfasd';
app.use(express.cookieParser(SITE_SECRET));
/* NOTE: We'll need to know the key used to store the session, so
 *       we explicitly define what it should be. Also, we pass in
 *       our sessionStore container here. */
app.use(express.session({
    key: 'express.sid',
    maxAge  : new Date(Date.now() + 3600000), //1 Hour
    expires : new Date(Date.now() + 3600000), //1 Hour
	store: sessionStore
}));


mail_client.on("connect", function(){
    mail_client.openMailbox("INBOX", function(error, info){
        if(error) throw error;
		
        console.log("Message count in INBOX: " + info.count);
    	// change this to all UNseen
		mail_client.listMessages(0,0, function(err, messages){
		    messages.forEach(function(message){
		        console.log(message.UID + ": " + message.title);
		    	
				// mark the message as read
				mail_client.addFlags(message.UID, ["\\Seen"], function(err, flags){
				    console.log("Current flags for a message: ", flags);
				});
				
				/*
				// delete the message
				client.deleteMessage(message.UID, function(err){
				    console.log(err || "success, message deleted");
				});
				*/			
			});
		});
	
	});
	
});

mail_client.on("new", function(message){
	ses = message.title.match(/session_id\:(\w+)/);
	if(ses){
		
		mail_client.deleteMessage(message.UID, function(err){
		    console.log(err || "success, message deleted");
		});
		
		if(sessionStore.sessions[ses[1]]){
			console.log('Setting session: '+ ses[1] + 'to: '+message.from.address);
			session_data = JSON.parse(sessionStore.sessions[ses[1]]);
			session_data.name = message.from.name;
			session_data.email = message.from.address;
			sessionStore.set(ses[1], session_data);
		}
	}
});

mail_client.connect();

app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', routes.index);

app.get('/doc', routes.doc);
app.get('/done', routes.done);

var setup = require('./routes/setup');
app.get('/setup', setup.index);
app.post('/setup/add_token', setup.add_token);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
