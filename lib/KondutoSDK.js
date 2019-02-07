'use strict';

const KondutoAPIError = require('./KondutoAPIError'),
	Promise = require('bluebird'),
	axios = require('axios'),
	joi = require('joi'),
	_ = require('lodash');


class KondutoSDK {
	/**
	 * Create new Konduto SDK client
	 * @param {Object} config 
	 */
	constructor(config = {}) {

		let {
			apiURL,
			apiTimeout,
			privateKey
		} = joi.attempt(
			config,
			joi.object({
				apiURL: joi.string().optional().default('https://api.konduto.com/v1'),
				apiTimeout: joi.number().optional().default(5000).integer().positive(),
				privateKey: joi.string().required()
			}).required()
		);

		this._client = axios.create({
			baseURL: apiURL,
			timeout: apiTimeout,
			responseType: 'json',
			responseEncoding: 'utf8',
			validateStatus: null
		});

		this._client.defaults.headers.common['Authorization'] = `Basic ${Buffer.from(privateKey).toString('base64')}`;

		this._client.interceptors.response.use(({
			status,
			data = {}
		} = {}) => {
			let error = 'Something went wrong';

			switch (status) {

				// OK # Success
				case 200:
				// Created # Item was created
				case 201:
					return Promise.resolve(data);
				
				// Bad Request # Error in request
				case 400: 
					error = 'There was a problem with request. The response body contains more information about the cause, most likely a syntax issue.';
					break;
				
				// Unauthorized # Problem with key authentication
				case 401:
					error = 'The API that was used is not valid. Please check the key format and it’s value in your dashboard.';
					break;

				// Forbidden # Problem with the account
				case 403:
					error = 'There is a problem with your account. Please get in touch with us for more information.';
					break;

				// Not Found # Not found
				case 404:
					error = 'The order was not found in our database.';
					break;

				// Method Not Allowed # Method does not exist
				case 405:
					error = 'The HTTP method used is not allowed for this resource.';
					break;

				// Too Many Requests # Request limit reached
				case 429:
					error = 'You have reached the limit of permitted requests. Please get in touch with us for more information.';
					break;

				// No Response # No response
				case 444:
					error = 'The address for the request is invalid and the server has closed the connection. Please check the URL you are using to send requests.';
					break;

				// Server Error # Internal server error
				case 500:
					error = 'There was an internal error when processing your request. You should get in touch with us for more information.';
					break;
			}

			return Promise.reject(new KondutoAPIError(error, status, data));
		});
		
		return this;
	}

}

module.exports = KondutoSDK;