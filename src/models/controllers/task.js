/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

const uuidV4 = require('uuid/v4')

/*
  Only invoked when a Task need to be created client side, rather than server
  side. That is, when the client 1) has no network connection OR 2) is not
  logged in.
*/
export const constructTaskLocally = (taskName, taskNotes,
  taskDueDateTimeUtc) => {

  const creationDateTimeUtc = new Date()

  return {
    name: taskName,
    notes: taskNotes,
    creationDateTimeUtc: creationDateTimeUtc,

    // initially updateTime = creationTime
    updatedAtDateTimeUtc: creationDateTimeUtc,

    dueDateTimeUtc: taskDueDateTimeUtc,
    id: 'client-task-' + uuidV4(),
    // Notably, no userId is assigned because one may not exist.
    // A successful sync will rectify any discrepencies.
  }
}

export const createTaskFromQueue = (task, userId, password) => {
  return createTask(task.name, task.notes, task.dueDateTimeUtc, userId,
     password)
}

export const createTask = (taskName, taskNotes, taskDueDateTimeUtc,
   userId, password) => {
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
       notes: taskNotes,
       dueDateTimeUtc: taskDueDateTimeUtc,
       // TODO -
     })
  }

  return invoke(request)
}

export const updateTaskFromQueue = (task, userId, password) => {
  return updateTask(task, userId, password)
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

export const deleteTaskFromQueue = (task, userId, password) => {
  return deleteTask(task.id, userId, password)
}

export const deleteTask = (taskId, userId, password) => {
  const request = {
    endpoint: `task/delete`,

    // POST because we do not immediately delete the Task.
    // The deletion must first be synced to all of the User's devices.
    method: 'POST',
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

import * as TaskStorage from '../storage/task-storage'
import * as ProfileStorage from '../storage/profile-storage'

// TODO - move this method to general-purpose file
async function getState() {

  let tasks = []
  let profile = undefined
  let isLoggedIn = false

  try {
    tasks = await TaskStorage.getAllTasks()
  } catch (err) { /* ignore */ }


  try {
    profile = await ProfileStorage.getMyProfile()
  } catch (err) { /* ignore */ }

  try {
    isLoggedIn = await ProfileStorage.isLoggedIn()
  } catch (err) { /* ignore */ }

  return {
    user: {
      profile: profile,
      isLoggedIn: isLoggedIn
    },
    tasks: tasks
  }
}

export const syncTasks = async (lastSuccessfulSyncDateTimeUtc) => {

  const state = await getState()

  console.log("state...")
  console.dir(state)

  if (!state.user.isLoggedIn) {
    return;
  }

  // TODO - refine
  const isoDateTimeUtc = lastSuccessfulSyncDateTimeUtc.toISOString()

  const userId = state.user.profile.id
  const password = state.user.profile.password

  // TODO - pass in (and store) the actual date

  const endpoint =
   `task/sync-tasks-after-timestamp/timestamp=${isoDateTimeUtc}`

  const request = {
    endpoint: endpoint,
    method: 'GET',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     }
  }

  return invoke(request)
  .then( response => {

    // TODO - log / inspect object / persist if necessary

    console.log("abc response...")
    console.dir(response)

    /*

    if (response.tasks && response.length > 0) {
      TaskStorage.createOrUpdateTasks(response.state.entities.tasks)
    }

    */

    return response
  })
  .catch(err => {
    console.log("task err...")
    console.dir(err)
  })
}
