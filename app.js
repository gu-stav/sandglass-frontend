var express = require('express'),
    http = require('http'),
    path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'sandglass/public')));
app.use(app.router);

app.all('*', function( req, res ) {
  res.sendfile('sandglass/index.html');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
