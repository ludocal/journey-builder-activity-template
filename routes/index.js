'use strict';

// Deps
var activity = require('./activity');
var https = require('https');

//CUSTOM_ACTIVITY_CONFIGURATION
var configApplication = JSON.parse(process.env.CUSTOM_ACTIVITY_CONFIGURATION);

/*
 * GET home page.
 */
exports.index = function (req, res) {
    //console.log(req);
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
    console.log('getApplicationList');
    console.log('req.query.endpoint: ', req.query.endpoint);
    console.log('req.query.token: ', req.query.token);
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
    //res.json( 'ERROR' );
};

exports.getTemplateList = function (req, res) {
    console.log('getTemplateList');
    console.log('req.query.endpoint: ', req.query.endpoint);
    console.log('req.query.token: ', req.query.token);
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
    //res.json( 'ERROR' );
};

function getMIDfromToken(token, host, callback) {
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
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            var str;
            res.on('data', (d) => {
                responseString += d;
            });
            res.on('end', (d) => {
                if (res.statusCode >= 400) {
                    callback(null, 0);
                }
                console.log(responseString);
                if (res.statusCode === 200) {
                    responseObject = JSON.parse(responseString);
                    callback(null, responseObject.organization.id);
                }
            });
        });

        req.on('error', (e) => {
            console.error(e);
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
        console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        var str;
        res.on('data', (d) => {
            responseString += d;
        });
        res.on('end', (d) => {
            responseObject = JSON.parse(responseString);
            if (res.statusCode >= 400) {
                console.error(responseObject);
                callback(responseObject, null);
            }
            console.log(responseString);
            if (res.statusCode === 200) {
                callback(null, responseObject);
            }
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
}


exports.login = function (req, res) {
    console.log('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function (req, res) {
    req.session.token = '';
};