
/**
 * Make a HTTP request
 * @param {string} endpoint
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method
 * @param {Object} payload
 * @param {FormData} formData
 * @returns {Promise<Response>} Promise of HTTP response
 */
function _fetch(endpoint, method, payload, formData) {
	const init = { headers: {} };

	if (method) {
		init.method = method;
	}
	if (payload) {
		init.body = JSON.stringify(payload);
		init.headers['Content-Type'] = 'application/json';
	}
	if (formData) {
		init.body = formData;
		// Content-Type header is set automatically
	}

	return fetch(endpoint, init)
		.then(response => {
			if (response.ok)
				return response; // return as is, no need to parse
			else
				return getProblemDetail(response);
		})
		.catch(error => {
			console.error(error);
			const problem = { status: 0 };
			problem.detail = "Please check your internet connection";
			return asFetchResponse(problem);
		});
}

/**
 * Extract the error message from the HTTP response.
 * @param {Response} response The HTTP response
 * @returns {Promise<Response>} The error response
 */
function getProblemDetail(response) {
	const status = response.status;
	return response.json()
		.then(problem => {
			if (!problem.status)
				problem.status = status;
			if (!problem.detail)
				problem.detail = problem.message;
			if (!problem.detail)
				problem.detail = "An error occurred: " + status;
			return asFetchResponse(problem);
		})
		.catch(error => {
			console.error(error);
			const problem = { status };
			problem.detail = "An error occurred: " + status;
			return asFetchResponse(problem);
		});
}

/**
 * @param {Object} problem
 * @returns {Response}
 */
function asFetchResponse(problem) {
	return {
		ok: false,
		status: problem.status,
		json: () => Promise.resolve(problem)
	};
}

/**
 * @param {Response} response The HTTP response
 */
function showProblemDetail(response) {
	return response.json().then(problem => {
		toast(problem.detail);
	});
}
