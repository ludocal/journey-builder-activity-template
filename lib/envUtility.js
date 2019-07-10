'use strict';
const fs = require('fs');
const Path = require('path');
const logUtility = require('./logUtility');
const logger = logUtility.getLogger();


module.exports.getEnv = function () {
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
	catch (e) {
		logger.error('Failed to parse application configuration JSON');
		process.exit(1);
	}
	return configApplication;
};
