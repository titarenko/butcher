var http = require('http');
var body = require('body/json')

http.createServer(function (req, res) {
	body(req, res, function (err, body) {
		console.log(new Date(), req.ip, req.url, err, body);
		res.end();
	});
}).listen(process.env.PORT || 6000);
