const PORT = 8080;
const ROOT = '../RandomChordGenerator/';

var express  = require('express');
var app = express();

// Homepage
app.get('/', function(request, response){
	response.sendFile('index.html', {root : ROOT});
});

app.get('/test', function(request, response){
	response.sendFile('test.html', {root : ROOT});
});

// Statics
app.use("/scripts", express.static(ROOT + 'scripts'));
app.use("/app", express.static(ROOT + 'app'));
app.use("/assets", express.static(ROOT + 'assets'));
app.use("/audio", express.static(ROOT + 'audio'));
app.use("/node_modules", express.static(ROOT + 'node_modules'));

app.listen(PORT, function(){
	//Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});