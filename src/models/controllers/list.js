/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

const uuid = require('uuid/v4');

/*
  Only invoked when a List need to be created client side, rather than server
  side. That is, when the client 1) has no network connection OR 2) is not
  logged in.
*/
export const constructListLocally = (listName, userId = undefined) => {
  return {
    name: listName,
    id: 'client-list-' + uuid(),
    ownerId: userId
    // Notably, no userId is assigned if it does not exist.
    // A successful sync will rectify any discrepencies.
  }
}

export const createList = (listName, userId, password) => {
  const request = {
    endpoint: `list/create`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       name: listName
     })
  }

  return invoke(request)
}

export const updateList = (list, userId, password) => {
  const request = {
    endpoint: `list/update`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       list: list
     })
  }

  return invoke(request)
}

export const deleteList = (listId, userId, password) => {
  const request = {
    endpoint: `list/delete`,
    method: 'DELETE',
    headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       listId: listId
     })
  }

  return invoke(request)
}

export const fetchListsByUserId = (userId, password) => {
    const request = {
      endpoint: `list/get-by-user-id/userId=${userId}`,
      method: 'GET',
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': constructAuthHeader(userId, password)
       },
    }

    return invoke(request)
}

export const fetchListByListId = (listId, userId, password) => {
  const request = {
    endpoint: `list/get-by-list-id/listId=${listId}&userId=${userId}`,
    method: 'GET',
    headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
  }

  return invoke(request)
  .then( response => response.list )
}
