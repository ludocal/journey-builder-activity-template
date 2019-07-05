'use strict';
var util = require('util');
var https = require('https');
const ET_Client = require('sfmc-fuelsdk-node');
const winston = require('winston');
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            return `[${info.timestamp}] - ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
var contextUser = {};
var clientMC = {};

exports.logExecuteData = [];
var configApplication = [];
//CUSTOM_ACTIVITY_CONFIGURATION
if (process.env.CUSTOM_ACTIVITY_CONFIGURATION === undefined){
    logger.error('Required Env variables is not set: CUSTOM_ACTIVITY_CONFIGURATION');
    throw new Error('Required Env variables is not set: CUSTOM_ACTIVITY_CONFIGURATION');
}
else{
    configApplication = JSON.parse(process.env.CUSTOM_ACTIVITY_CONFIGURATION);
}


/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
    //res.send(200, 'Edit');
    res.status(200).send('body');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
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
            logger.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            logger.debug(JSON.stringify(decoded));
            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];

            decodedArgs.appSelection.forEach(element => {
                //set common values
                var pushWrapper = {};
                pushWrapper.group_id = string_to_slug(decodedArgs.groupid) || decoded.activityId;
                pushWrapper.recipients = {};
                pushWrapper.recipients.custom_ids = [decodedArgs.contactIdentifier];
                //set values with template selection
                if (decodedArgs.formatSelection === "template") {
                    pushWrapper.template_id = element.templateId;
                }
                //set values for new template
                if (decodedArgs.formatSelection === "new" || (decodedArgs.overrideMessage && decodedArgs.overrideMessage === true)) {
                    if (decodedArgs.title !== null && decodedArgs.title !== '') {
                        pushWrapper.message = pushWrapper.message === undefined ? {} : pushWrapper.message;
                        pushWrapper.message.title = decodedArgs.title;
                    }
                    if (decodedArgs.body !== null && decodedArgs.body !== '') {
                        pushWrapper.message = pushWrapper.message === undefined ? {} : pushWrapper.message;
                        pushWrapper.message.body = decodedArgs.body;
                    }
                    if (decodedArgs.deepLink !== null && decodedArgs.deepLink !== '') {
                        pushWrapper.deeplink = decodedArgs.deepLink;
                    }
                    if (decodedArgs.imageUrl !== null && decodedArgs.imageUrl !== '') {
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
            logger.error('inArguments invalid.');
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
    //logData(req);
    //res.send(200, 'Publish');
    res.status(200).send('Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    //logData(req);
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
            logger.error(error);
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
        logger.debug('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        var str;
        res.on('data', (d) => {
            responseString += d;
        });
        res.on('end', (d) => {
            responseObject = JSON.parse(responseString);
            if (res.statusCode >= 400) {
                logPushEvent({
                    api_key: appKey, contact_key: pushWrapper.recipients.custom_ids[0],
                    token: pushWrapper.group_id + Date.now(), event: 'error',
                    api_error: responseObject.message, group_id: pushWrapper.group_id, event_date: new Date().toISOString(),
                    journey_id: decoded.journeyId, activity_id: decoded.activityId
                }, (err, msg) => { });
            }
            logger.debug(responseString);
            if (res.statusCode === 201) {
                logPushEvent({
                    api_key: appKey, contact_key: pushWrapper.recipients.custom_ids[0],
                    token: responseObject.token, event: 'accepted',
                    group_id: pushWrapper.group_id, event_date: new Date().toISOString(),
                    journey_id: decoded.journeyId, activity_id: decoded.activityId
                }, (err, msg) => { });
            }
        });
    });

    req.on('error', (e) => {
        logger.error(e);
    });
    logger.debug(JSON.stringify(pushWrapper));
    req.write(JSON.stringify(pushWrapper));
    req.end();
}

function initMarketingCloud() {
    logger.info('Init Marketing Cloud Token');
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
    logger.info('Insert BATCH_PUSH EVENT');
    const Name = 'BATCH_PUSH';
    clientMC.dataExtensionRow({ Name, props }).post((err, response) => {
        if (err) {
            logger.info('Error inserting to BATCH_PUSH');
            console.log(err);
            throw new Error(err);
        }
        logger.debug('INSERTED BATCH_PUSH ROW');
        callback(err, response);
    });
}

function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}