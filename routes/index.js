'use strict';

// Deps
var activity = require('./activity');
var https = require('https');
const winston = require('winston');
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            return `[${info.timestamp}] - ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            level: 'debug'
        })
    ]
});

const fs = require('fs');
const Path = require('path');

var configApplicationRaw, configApplication = [];

// try to get configuration from CUSTOM_ACTIVITY_CONFIGURATION env var
if (typeof (process.env.CUSTOM_ACTIVITY_CONFIGURATION) !== 'undefined') {
    configApplicationRaw = process.env.CUSTOM_ACTIVITY_CONFIGURATION;
    logger.info('Get application configuration from `CUSTOM_ACTIVITY_CONFIGURATION` environment variable');
}
// try to get configuration from config/config.json file instead
else {
    let configApplicationFilename = 'config/config.json';
    logger.info('Get application configuration from ' + configApplicationFilename + ' file');
    try {
        configApplicationRaw = fs.readFileSync(Path.join(Path.dirname(__dirname), configApplicationFilename));
    }
    catch (e) {
        logger.error('Failed to get or open ' + configApplicationFilename + ' file');
        process.exit(1);
    }
}

try {
    configApplication = JSON.parse(configApplicationRaw);
}
catch(e) {
    logger.error('Failed to parse application configuration JSON');
    process.exit(1);
}

/*
 * GET home page.
 */
exports.index = function (req, res) {
    //console.log(req);
    logger.info('Get Home page');
    if (req.session && !req.session.token) {
        res.render('index', {
            title: 'Unauthenticated',
            errorMessage: 'This app may only be loaded via Salesforce Marketing Cloud'
        });
    } else {
        res.render('index', {
            title: 'Journey Builder Activity',
            results: activity.logExecuteData
        });
    }
};

exports.getApplicationList = function (req, res) {
    logger.info('Request ApplicationList');
    logger.debug('request query: ' + JSON.stringify(req.query));
    logger.debug('req.query.endpoint: ', req.query.endpoint);
    logger.debug('req.query.token: ', req.query.token);
    var endpoint = req.query.endpoint;
    var token = req.query.token;
    var host = endpoint.replace("https://", "").replace("/", "");

    getMIDfromToken(token, host, function (error, response) {
        configApplication.forEach(element => {
            if (response === element.mid) {
                res.json(element.appAvailable);
            }
        });
    });
};

exports.getTemplateList = function (req, res) {
    logger.info('Request Template List');
    logger.debug('req.query.endpoint: ', req.query.endpoint);
    logger.debug('req.query.token: ', req.query.token);
    var endpoint = req.query.endpoint;
    var token = req.query.token;
    var appKey = req.query.appKey;
    var host = endpoint.replace("https://", "").replace("/", "");

    getMIDfromToken(token, host, function (error, response) {
        configApplication.forEach(element => {
            if (response === element.mid) {
                getTemplateFromBatch(appKey, element.apiRestToken, (err, response) => {
                    if (err) {
                        return res.status(400).end();
                    }
                    return res.json(response).end();
                })
            }
        });
    });
};

function getMIDfromToken(token, host, callback) {
    logger.info('Start getMIDfromToken');
    logger.debug('Token : ' + token);
    logger.debug('Host : ' + host);
    configApplication.forEach(element => {
        const options = {
            hostname: host,
            path: '/platform/v1/tokenContext',
            method: 'GET',
            headers: { 'Content-Type': "application/json", 'Authorization': "Bearer " + token }
        };
        var responseString = "";
        var responseObject;
        const req = https.request(options, (res) => {

            res.on('data', (d) => {
                responseString += d;
            });
            res.on('end', (d) => {
                logger.debug('Response status code : ' + res.statusCode);
                logger.debug('Response status message : ' + res.statusMessage);
                if (res.statusCode >= 400) {
                    callback(null, 0);
                }
                logger.debug(responseString);
                if (res.statusCode === 200) {
                    responseObject = JSON.parse(responseString);
                    callback(null, responseObject.organization.id);
                }
            });
        });

        req.on('error', (e) => {
            logger.error(e);
        });
        req.end();
    });
}

function getTemplateFromBatch(appKey, apiRestToken, callback) {
    const options = {
        hostname: 'api.batch.com',
        path: '/1.1/' + appKey + '/campaigns/list?limit=20&live=false',
        method: 'GET',
        headers: { 'Content-Type': "application/json", 'X-Authorization': apiRestToken }
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
                logger.error(responseObject);
                callback(responseObject, null);
            }
            logger.debug(responseString);
            if (res.statusCode === 200) {
                callback(null, responseObject);
            }
        });
    });

    req.on('error', (e) => {
        logger.error(e);
    });
    req.end();
}


exports.login = function (req, res) {
    logger.debug('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function (req, res) {
    req.session.token = '';
};