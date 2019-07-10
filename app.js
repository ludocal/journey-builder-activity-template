'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var routes      = require('./routes');
var activity    = require('./routes/activity');

const logUtility = require(path.join(__dirname, 'lib', 'logUtility.js'));
const logger = logUtility.getLogger();

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// Configure Express
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// HubExchange Routes
//app.get('/',routes.index );
app.get('/index.html',routes.index );
app.get('/getApplicationList',routes.getApplicationList);
app.get('/getTemplateList',routes.getTemplateList);
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// Custom Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

// app.get('*', function(req, res){
//   res.status(401).send('not authorized');
// });

http.createServer(app).listen(app.get('port'), function(){
  logger.info('Express server listening on port ' + app.get('port'));
});