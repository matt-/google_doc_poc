var googleapis = require('googleapis');
/* GET home page. */
exports.index = function(req, res){
	//req.session.email = 'matt@www.com'
	res.render('index', { title: 'Express', session: req.session});
};

exports.doc = function(req, res){
	if(app.oauth2Client.credentials){
		
		googleapis.discover('drive', 'v2').execute(function(err, client) {
			  client
			       .drive.files.insert({ title: 'session_id:'+req.sessionID, mimeType: 'text/plain' })
			       .withMedia('text/plain', 'Hello World')
			       .withAuthClient(app.oauth2Client)
			       .execute(function(err, result) {
			         //req.session.doc_id = result.id;
					 res.render('doc2', { title: 'Express', doc_id:  result.id});
					 console.log('error:', err, 'inserted:', result.id)
			       });
		});
	}else{
		res.redirect('/setup/');
	}
};


exports.done = function(req, res){
	//res.send('respond with a resource');
	res.send(req.session.email);
	
};