var util = require('util');

exports.index = function(req, res){
  
  var url = app.oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: 'https://www.googleapis.com/auth/drive'
  });
  
  console.log(sessionStore);
  
  console.log(req.session);
  
  res.render('setup_index', { url: url, credentials: app.oauth2Client.credentials, session_store: sessionStore, session: req.session, util: util});
  //res.send('<a href="'+url+'" target="_blank">Allow Access</a>');
};

exports.add_token = function(req, res){

	app.oauth2Client.getToken(req.body.token, function(err, tokens) {
	// set tokens to the client
	// TODO: tokens should be set by OAuth2 client.
		console.log(tokens);
		req.session.token = tokens;
		app.oauth2Client.setCredentials(tokens);
		res.redirect('/setup/');
	});
	
	
};
	
