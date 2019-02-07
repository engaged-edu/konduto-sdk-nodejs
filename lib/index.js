'use strict';

const KondutoSDK = require('./KondutoSDK'),
	KondutoAPIError = require('./KondutoAPIError');

module.exports = {
	SDK: KondutoSDK,
	Errors: {
		KondutoAPIError
	}
};