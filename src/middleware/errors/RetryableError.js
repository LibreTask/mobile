/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

/*
  When this error is thrown, the client should reattempt the network request.
*/
function RetryableError(message) {
  this.name = "RetryableError";
  this.message = message || "Something went wrong, please try again later";
  this.stack = new Error().stack;
}
RetryableError.prototype = Object.create(Error.prototype);
RetryableError.prototype.constructor = RetryableError;

export default RetryableError;
