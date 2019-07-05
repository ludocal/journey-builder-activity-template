'use strict';
var util = require('util');
var https = require('https');
const ET_Client = require('sfmc-fuelsdk-node');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
var contextUser = {};
var clientMC = {};

exports.logExecuteData = [];
//CUSTOM_ACTIVITY_CONFIGURATION
var configApplication = JSON.parse(process.env.CUSTOM_ACTIVITY_CONFIGURATION);

// var configApplication = [{
//     apiRestToken: 'dcee600f7a7be131481e28ddb40ae1b0',
//     domain: 'mcwd-d2pprjfdcksy88llpp9dv-4',
//     jwtSecret: 'jntkXQazwsJZq_dIZsgz3YRGRMs9jpU-AKEhA3BN42WRmWYAT1jcb3aW5J4lzEmidqtHqc6vqY4Z-qEFIOFQv-GtOUDq4e5D-baF4Tk2mSy4aF66zOSX-vH9GpeFjR2r5VasSAYBC42MYui1GJHZ0mLEVkZbaNfT6sZfH2mth58A9-thITgLqgYXFjJ14V3dFtG8uoERp1RKZXeG_l8n9_iWPtG6DaNPFQWVLV-srtiKpZCe68Qw1NSAWBBc3A2',
//     mid: 500008428,
//     clientId: '75ltplaovygkrhqzrkbi27yj',
//     clientSecret: 'guaLsbOmBEUc6cf11F7npGM3',
//     authOrigin: "https://mcwd-d2pprjfdcksy88llpp9dv-4.auth.marketingcloudapis.com",
//     soapOrigin: "https://mcwd-d2pprjfdcksy88llpp9dv-4.soap.marketingcloudapis.com",
//     appAvailable: [
//         {
//             name: 'Batch STORE IOS',
//             id: '5CDD1B576095D88F6FE92DA49189D2'
//         },
//         {
//             name: 'BATCH STORE ANDROID',
//             id: '5CDD1B576095D88F6FE92DA49189D2'
//         }]
// }];

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
    //console.log(JSON.stringify(req.body.toString('utf8')));
    //console.log(JSON.stringify(req.body));
    // example on how to decode JWT
    getClientByJWT(req.body, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            console.log(JSON.stringify(decoded));
            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];
            console.log(JSON.stringify(decodedArgs));

            decodedArgs.appSelection.forEach(element => {
                //set common values
                var pushWrapper = {};
                pushWrapper.group_id = decodedArgs.groupid || decoded.activityId;
                pushWrapper.recipients = {};
                pushWrapper.recipients.custom_ids = [decodedArgs.contactIdentifier];
                //set values with template selection
                if (decodedArgs.formatSelection === "template")
                {
                    pushWrapper.template_id = element.templateId;
                }
                //set values for new template
                if (decodedArgs.formatSelection === "new" || (decodedArgs.overrideMessage && decodedArgs.overrideMessage === true )) {
                    pushWrapper.message = {};
                    if (decodedArgs.title !== null && decodedArgs.title !== '')
                    {
                      pushWrapper.message.title = decodedArgs.title;  
                    }
                    if (decodedArgs.body !== null && decodedArgs.body !== '')
                    {
                      pushWrapper.message.body = decodedArgs.body;  
                    }
                    if (decodedArgs.deepLink !== null && decodedArgs.deepLink !== '')
                    {
                      pushWrapper.message.deepLink = decodedArgs.deepLink;  
                    }
                    if (decodedArgs.imageUrl !== null && decodedArgs.imageUrl !== '')
                    {
                        pushWrapper.media = {};
                        pushWrapper.media.picture = decodedArgs.imageUrl;
                        pushWrapper.skip_media_check = true;
                    }
                }
                sendPush(element.id, pushWrapper, decoded);
            });

            //logData(req);
        res.send(200, 'Execute');
            
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

function getClientByJWT(reqBody, callback) {
    configApplication.forEach((val, key, configApplication) => {
        try {
            var decoded = JWT.verifySync(reqBody, configApplication[key].jwtSecret);
            contextUser = configApplication[key];
            initMarketingCloud();
            callback(null, decoded);
            return;
        } catch (error) {
            console.log(error);
        }
    });
    // callback("JWT NOT FOUND", null);
    // return;
}

function sendPush(appKey, pushWrapper, decoded) {
    const options = {
        hostname: 'labs.api.batch.com',
        path: '/1.1/' + appKey + '/transactional/send',
        method: 'POST',
        headers: { 'Content-Type': "application/json", 'X-Authorization': contextUser.apiRestToken }
    };
    var responseString = "";
    var responseObject;
    const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        var str;
        res.on('data', (d) => {
            responseString += d;
        });
        res.on('end', (d) => {
            responseObject = JSON.parse(responseString);
            if (res.statusCode >= 400) {
                logPushEvent({api_key: appKey, contact_key: pushWrapper.recipients.custom_ids[0], 
                    token: pushWrapper.group_id + Date.now(), event: 'error', 
                    api_error: responseObject.message, group_id: pushWrapper.group_id, event_date: new Date().toISOString(),
                journey_id: decoded.journeyId, activity_id: decoded.activityId},(err, msg) => {});  
            }
            console.log(responseString);
            if (res.statusCode === 201) {
                  logPushEvent({api_key: appKey, contact_key: pushWrapper.recipients.custom_ids[0], 
                    token: responseObject.token, event: 'accepted', 
                    group_id: pushWrapper.group_id, event_date: new Date().toISOString(),
                    journey_id: decoded.journeyId, activity_id: decoded.activityId},(err, msg) => {});
            }
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    console.log(JSON.stringify(pushWrapper));
    req.write(JSON.stringify(pushWrapper));
    req.end();
}

function initMarketingCloud()
{
    console.log('Init Marketing Cloud Token');
    clientMC = new ET_Client(contextUser.clientId, contextUser.clientSecret, null,
        {
            authOrigin: contextUser.authOrigin,
            soapOrigin: contextUser.soapOrigin,
            authOptions: {
                authVersion: 2
            }
        });
}
function logPushEvent(props, callback) { 
    console.log('Insert BATCH_PUSH EVENT');
    const Name = 'BATCH_PUSH';
    clientMC.dataExtensionRow({ Name, props }).post((err, response) => {
        if (err) {
            console.log('Error inserting to BATCH_PUSH');
            console.log(err);
            throw new Error(err);
        }
        console.log('[DEBUG] INSERTED BATCH_PUSH ROW');
        callback(err, response);
    });
}