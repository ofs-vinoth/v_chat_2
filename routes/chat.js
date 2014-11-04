
module.exports = function(req, res, next) {
	 var options = {
		root: __dirname + '/../views/',
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		}
	  };
	  var fileName = "chat.html";
	  res.sendFile(fileName, options, function (err) {
		if (err) {
		  console.log(err);
		  res.status(err.status).end();
		}
		else {
		  console.log('Sent:', fileName);
		}
	  });  
};
