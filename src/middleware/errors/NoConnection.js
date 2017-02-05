/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

/*
  When this error is thrown, the client should attempt to perform the action
  locally if it can wait for the next successful sync.

  Example: Client cannot create a List because no Internet connection. We throw
  this error, create the List locally, and then the next successful Sync pushes
  this state to the server.
*/
function NoConnection(message) {
  this.name = 'NoConnection';
  this.message = message
    || 'Could not reach the server, please try again later';
  this.stack = (new Error()).stack;
}
NoConnection.prototype = Object.create(Error.prototype);
NoConnection.prototype.constructor = NoConnection;

export default NoConnection
