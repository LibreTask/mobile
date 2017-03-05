/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

const uuid = require('uuid/v4')

/*
  Only invoked when a Task need to be created client side, rather than server
  side. That is, when the client 1) has no network connection OR 2) is not
  logged in.
*/
export const constructTaskLocally = (taskName, listId) => {
  return {
    name: taskName,
    id: 'client-task-' + uuid(),
    listId: listId
    // Notably, no userId is assigned because one may not exist.
    // A successful sync will rectify any discrepencies.
  }
}

export const createTask = (taskName, listId, userId, password) => {
  const request = {
    endpoint: `task/create`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       name: taskName,
       listId: listId
       // TODO -
     })
  }

  return invoke(request)
}

export const updateTask = (task, userId, password) => {
    const request = {
      endpoint: `task/update`,
      method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': constructAuthHeader(userId, password)
       },
       body: JSON.stringify({
         task: task
       })
    }

    return invoke(request)
}

export const deleteTask = (taskId, userId, password) => {
  const request = {
    endpoint: `task/delete`,
    method: 'DELETE',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       taskId: taskId
     })
  }

  return invoke(request)
}

export const fetchTask = (taskId, userId, password) => {
  const request = {
      endpoint: `task/get-task-by-id/taskId=${taskId}`,
      schema: TaskSchema,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': constructAuthHeader(userId, password)
      },
  }

  return invoke(request)
}

export const fetchTasksByAttributes = (attributes, userId, password) => {

  let query = `userId=${userId}&`;

  if (attributes.listId) {
    query += `listId=${attributes.listId}`
  }

  // TODO - use additional atributes as well

  const request = {
    endpoint: `task/get-by-attributes/${query}`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': constructAuthHeader(userId, password)
    },
  }

  return invoke(request)
    .then( response => response.tasks )
}
