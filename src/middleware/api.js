/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import RetryableError from "./errors/RetryableError";
import ErrorCodes from "./errors/ErrorCodes";

const API_ROOT = "https://libretask.org/api/v1/";

const MAX_RETRIES = 3;

const Buffer = require("buffer").Buffer;

export function constructAuthHeader(userId, password) {
  if (!userId || !password) {
    throw new Error("Failed to construct auth header because of invalid arguments!");
  }

  return "Basic " + new Buffer(userId + ":" + password).toString("base64");
}

// TODO - move this to its own module
// TODO - use a hash for this
function humanReadableError(errorCode) {
  try {
    if (errorCode === ErrorCodes.USER_DOES_NOT_EXIST) {
      return "That user does not exist";
    } else if (errorCode === ErrorCodes.EMAIL_IS_ALREADY_USED) {
      return "That email is already used";
    } else if (errorCode === ErrorCodes.INVALID_LOGIN) {
      return "Either email or password is invalid";
    } else {
      return "Something went wrong, please try again later";
    }
  } catch (err) {
    return "Something went wrong, please try again later";
  }
}

export function invoke(request, retriesRemaining) {
  const { endpoint, method, headers, body } = request;

  return _invoke(endpoint, method, headers, body).catch(err => {
    if (retriesRemaining === undefined) {
      retriesRemaining = MAX_RETRIES;
    }

    let shouldRetry = err instanceof RetryableError;
    shouldRetry &= method === "GET";
    shouldRetry &= retriesRemaining >= 1;

    if (shouldRetry) {
      let retryAttemptNumber = MAX_RETRIES - retriesRemaining;

      return _retryWait(retryAttemptNumber).then(() => {
        return invoke(request, retriesRemaining - 1);
      });
    } else {
      throw err;
    }
  });
}

function _invoke(endpoint, method, headers, body) {
  const fullUrl =
    endpoint.indexOf(API_ROOT) === -1 ? API_ROOT + endpoint : endpoint;

  return fetch(fullUrl, {
    method: method,
    headers: headers,
    body: body
  })
    .then(response => {
      if (response.status >= 500) {
        throw new RetryableError();
      }
      return response.json();
    })
    .then(response => {
      if (response.errorCode) {
        throw new Error(humanReadableError(response.errorCode));
      } else {
        return response;
      }
    })
    .catch(error => {
      // TODO - refine retry logic

      if (_isTimeoutError(error)) {
        throw new RetryableError();
      } else {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(error);
      }
    });
}

function _isTimeoutError(err) {
  // TODO - fix this brittle check
  return (
    err &&
    (err.message === "Network request failed" || err instanceof RetryableError)
  );
}

function _retryWait(retryAttemptNumber) {
  // TODO - refine this value
  let retryDurationMillis = 1000 * 1.5 * retryAttemptNumber;

  return new Promise(resolve => setTimeout(resolve, retryDurationMillis));
}
