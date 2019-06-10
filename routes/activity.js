'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');

exports.logExecuteData = [];
var configApplication = [{
    apiRestToken: 'dcee600f7a7be131481e28ddb40ae1b0',
    domain: 'mcwd-d2pprjfdcksy88llpp9dv-4',
    jwtSecret: 'op8QmUhBtKVlOU2HS6sczo0SnSLxmBp_YllUAYv5hscd9xANRqV1aFdsmqWrP7_5wQ14Luj5pVIBhTdj84Wuf4LdwtfybXu123_BNnhfLWXeiuIj5_kfyvpf7KXkwYIVhFnQtJDNQxpmzP-HhqKSBAtoC-CSGhyDJA6yI2b0vMrCTeSyaLemy8MoOG5YiU3B_TPPFq4KdYEPyz24PSxCBBODlAMLcOSG4XXR5tfLz1CYk2QIExWM1hySosElPQ2',
    mid: 500008428,
    appAvailable:[
    {
        name:'Batch STORE IOS',
        id: '5CDD1B576095D88F6FE92DA49189D2'
    },
    {
        name: 'BATCH STORE ANDROID',
        id: '5CDD1B576095D88F6FE92DA49189D2'
    }]
}];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    //res.send(200, 'Edit');
    res.status(200).send('body');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    //res.send(200, 'Save');
    res.status(200).send('Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
    console.log(JSON.stringify(req.body.toString('utf8')));
    console.log(JSON.stringify(req.body));
    // example on how to decode JWT
    getClientByJWT(req.body, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            
            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];
            
            logData(req);
            //res.send(200, 'Execute');
            res.status(200).send('Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    //res.send(200, 'Publish');
    res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    //res.send(200, 'Validate');
    res.status(200).send('Validate');
};

function getClientByJWT(reqBody, callback)
{
    configApplication.forEach((val, key, configApplication)  => {
        JWT(reqBody, configApplication[key].jwtSecret, (err, decoded) => {
           
                callback(err, decoded);
           
        });       
    });
}