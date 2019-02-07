'use strict';

class KondutoAPIError extends Error {
	constructor(message, status, data) {
		super(message);
		this.statusCode = status;
		this.responseData = data;
		return this;
	}
};

module.exports = KondutoAPIError;