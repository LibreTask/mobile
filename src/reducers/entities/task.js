/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  ADD_PENDING_TASK_CREATE,
  ADD_PENDING_TASK_UPDATE,
  ADD_PENDING_TASK_DELETE,
  REMOVE_PENDING_TASK_CREATE,
  REMOVE_PENDING_TASK_UPDATE,
  REMOVE_PENDING_TASK_DELETE,
  START_QUEUED_TASK_SUBMIT,
  STOP_QUEUED_TASK_SUBMIT,
  CREATE_OR_UPDATE_TASK,
  CREATE_OR_UPDATE_TASKS,
  DELETE_ALL_TASKS,
  DELETE_TASK,
  START_TASK_SYNC,
  END_TASK_SYNC,
  SYNC_TASKS
} from '../../actions/entities/task'
import { updateObject } from '../reducer-utils'

import * as _ from 'lodash'

function removeTask(tasks, taskId) {
  let remainingTasks = _.filter(tasks, function(task) {
    return task.id !== taskId // filter out taskId
  })

  return remainingTasks
}

function addPendingTaskCreate(state, action) {
  let newTaskEntry = {}
  newTaskEntry[action.task.id] = action.task

  let queuedCreates =
    updateObject(state.pendingTaskActions.create, newTaskEntry)

  return updateObject(state, {
    pendingTaskActions: {
      create: queuedCreates,
      update: state.pendingTaskActions.update,
      delete: state.pendingTaskActions.delete
    }
  })
}

function addPendingTaskUpdate(state, action) {

  let taskId = action.task.id
  let newTaskEntry = {}
  newTaskEntry[taskId] = action.task

  let updatedPendingTaskActions = undefined

  // the task is already queued to be created; replace it
  if (taskId in state.pendingTaskActions.create) {
   let queuedCreates =
      updateObject(state.pendingTaskActions.create, newTaskEntry)

   updatedPendingTaskActions = {
     create: queuedCreates,
     updated: state.pendingTaskActions.update,
     delete: state.pendingTaskActions.delete
   }
 } else {

   /*
      This block handles the following cases:
      1. The task is already queued to be deleted
      2. The task is already queued to be updated
      3. The task is not queued for anything

      For all these scenarios, we want to queue an update.
   */

   let queuedUpdates =
      updateObject(state.pendingTaskActions.update, newTaskEntry)

   updatedPendingTaskActions = {
     update: queuedUpdates,
     create: state.pendingTaskActions.create,
     delete: state.pendingTaskActions.delete
   }
 }

  return updateObject(state, {
    pendingTaskActions: updatedPendingTaskActions
  })
}

function addPendingTaskDelete(state, action) {

  let taskId = action.task.id
  let newTaskEntry = {}
  newTaskEntry[taskId] = action.task

  let updatedPendingTaskActions = undefined

  // the task is already queued to be created; remove it from creation
  if (taskId in state.pendingTaskActions.create) {
     let remainingTasks = removeTask(state.pendingTaskActions.create, taskId)

     let taskMap = {}
     _.forEach(remainingTasks, (task) => {
       taskMap[task.id] = task
     })

     updatedPendingTaskActions = {
       create: taskMap,
       update: state.pendingTaskActions.update,
       delete: state.pendingTaskActions.delete
     }
   }
   /*
    If the task is not queued to be deleted, queue it now.

    If the task is already queued to be updated; queue it for deletion anyways,
    because the backend design is such that deletes and updates do not conflict
    with each other.
   */
   else if (!(taskId in state.pendingTaskActions.delete)
      || (taskId in state.pendingTaskActions.update)) {
    let queuedDeletes =
      updateObject(state.pendingTaskActions.delete, newTaskEntry)

    updatedPendingTaskActions = {
      delete: queuedDeletes,
      update: state.pendingTaskActions.update,
      create: state.pendingTaskActions.create
    }
   }
   // the task is already queued to be deleted; do nothing
   else {
     updatedPendingTaskActions = state.pendingTaskActions
   }

   return updateObject(state, {
     pendingTaskActions: updatedPendingTaskActions
   })
}

function removePendingTaskCreate(state, action) {

  let remainingTasks = removeTask(state.pendingTaskActions.create,
     action.taskId)

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  let clientAssignedTaskId = action.taskId
  let serverAssignedTaskId = action.serverAssignedTaskId

  // TODO - refine the approach of replacing the existing task
  let task = Object.assign({}, state.tasks[clientAssignedTaskId])
  task.id = serverAssignedTaskId
  delete state.tasks[clientAssignedTaskId] // delete existing task
  state.tasks[serverAssignedTaskId] = task // replace with new ID

  return updateObject(state, {
    pendingTaskActions: {
      create: taskMap,
      update: state.pendingTaskActions.update,
      delete: state.pendingTaskActions.delete
    }
  })
}

function removePendingTaskUpdate(state, action) {

  let remainingTasks = removeTask(state.pendingTaskActions.update,
     action.taskId)

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  return updateObject(state, {
    pendingTaskActions: {
      update: taskMap,
      create: state.pendingTaskActions.create,
      delete: state.pendingTaskActions.delete
    }
  })
}

function removePendingTaskDelete(state, action) {

  let remainingTasks = removeTask(state.pendingTaskActions.delete,
     action.taskId)

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  return updateObject(state, {
    pendingTaskActions: {
      delete: taskMap,
      create: state.pendingTaskActions.create,
      update: state.pendingTaskActions.update
    }
  })
}

function startQueuedTaskSubmit(state, action) {
  return updateObject(state, {
    isSubmittingQueuedTasks: true,
    queuedTaskSubmitIntervalId: action.intervalId
  })
}

function stopQueuedTaskSubmission(state, action) {
  clearInterval(state.intervalId) // TODO - is this the best place to do it?

  return updateObject(state, {
    isSubmittingQueuedTasks: false,
    queuedTaskSubmitIntervalId: undefined
  })
}

function startTaskSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    syncIntervalId: action.intervalId
  })
}

function endTaskSync(state, action) {
  clearInterval(state.intervalId) // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    syncIntervalId: undefined
  })
}

function deleteAllTasks(state, action) {
  return updateObject(state, {
    tasks: { /* all tasks are deleted */ }
  })
}

function deleteTask(state, action) {
  let remainingTasks = removeTask(state.tasks, action.taskId)

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  return updateObject(state, { tasks: taskMap })
}

function addTasks(state, action) {
  let normalizedTasks = {}
  _.forEach(action.tasks, (task) => {
    normalizedTasks[task.id] = task
  })
  return updateObject(state,
    {
      tasks: updateObject(state.tasks, normalizedTasks),
    }
  )
}

function addTask(state, action) {
  return addNormalizedTask(state, action.task)
}

function addNormalizedTask(state, normalizedTask) {

  let updatedTaskEntry = {}
  updatedTaskEntry[normalizedTask.id] = normalizedTask

  return updateObject(state,
    {
      tasks: updateObject(state.tasks, updatedTaskEntry)
    }
  )
}

/*
  Always update lastSuccessfulSyncDateTimeUtc, because it is assumed that
  this reducer is ONLY invoked after a successful sync.
*/
function syncTasks(state, action) {

  const syncedTasks = action.tasks
  const existingTasks = state.tasks

  console.log("synced tasks...")
  console.dir(syncedTasks)

  console.log("existing tasks...")
  console.dir(existingTasks)

  let tasksToCreateOrUpdate = []

  _.forEach(syncedTasks, (syncedTask) => {

    if (syncedTask.id in existingTasks) {

      const syncedTaskUpdateDateTimeUtc = syncedTask.updatedAtDateTimeUtc
      const existingTaskUpdateDateTimeUtc =
        existingTasks[syncedTask.id].updatedAtDateTimeUtc

      if (syncedTaskUpdateDateTimeUtc > existingTaskUpdateDateTimeUtc
          && syncedTaskDoesNotConflictWithQueuedTask(state, syncedTask)) {
        // synced task was updated more recently than the version on
        // this device. so we must mark it for update/creation.
        tasksToCreateOrUpdate.push(syncedTask)
      } else {
        /*
          The synced task was less up-to-date than the version residing on the
          client. This is expected in some scenarios, such as when the client
          looses network connectivity, and must queue up a task action.

          For this case, we do nothing here. The queue-logic is designed to
          completely handle such scenarios.
        */
      }

    } else {
      // synced task does not already exist on this device.
      // so we must mark it for update/creation.
      tasksToCreateOrUpdate.push(syncedTask)
    }
  })

  console.log("tasks to create or update...")
  console.dir(tasksToCreateOrUpdate)

  return addTasks(state, {
    tasks: tasksToCreateOrUpdate,
    lastSuccessfulSyncDateTimeUtc: action.lastSuccessfulSyncDateTimeUtc
  })
}

/*
  This method is not expected to always be correct. There are many nuances
  involved with correctly syncing and queueing state, especially as more
  clients are involved and the network is assumed to be unreliable.

  The current approach is to simply return false if the synced task was updated
  at a LESS RECENT date than the task on the client.
*/
function syncedTaskDoesNotConflictWithQueuedTask(state, syncedTask) {

  let pendingTaskActions = state.pendingTaskActions

  console.log("pending task actions...")
  console.dir(pendingTaskActions)

  console.log("synced task...")
  console.dir(syncedTask)

  if (syncedTask.id in pendingTaskActions.create) {
    // This should never happen. It would indicate either a bug (most likely)
    // or a UUID collision resulting from a client-assigned id being identical
    // to a server-assignd id (near impossible).
    throw new Error("Synced task was found in to-be-created queue.")
  }
  else if (syncedTask.id in pendingTaskActions.update) {

    let queuedTask = pendingTaskActions.update[syncTask.id]

    // TODO - improve

    if (syncTask.updatedAtDateTimeUtc > queuedTask.updatedAtDateTimeUtc) {
      return false
    } else {
      return false
    }
  }
  else if (syncedTask.id in pendingTaskActions.delete) {

    let queuedTask = pendingTaskActions.delete[syncTask.id]

    // TODO - improve

    if (syncTask.updatedAtDateTimeUtc > queuedTask.updatedAtDateTimeUtc) {
      return false
    } else {
      return false
    }
  }
  else {
    /* the synced task does not conflict; it is not in the queue. */
    return true
  }
}

const initialState = {
  tasks: {
    // taskId: {public task attributes}
  },
  pendingTaskActions: {
    update: {
      // taskId: {public task attributes}
    },
    delete: {
      // taskId: {public task attributes}
    },
    create: {
      // taskId: {public task attributes}
    }
  },
  isSyncing: false,
  syncIntervalId: undefined, // used to cancel sync
  lastSuccessfulSyncDateTimeUtc: undefined,
  isSubmittingQueuedTasks: false,
  queuedTaskSubmitIntervalId: undefined
}

function tasksReducer(state = initialState, action) {
  switch(action.type) {

    /*
      TODO - doc
    */
    case START_QUEUED_TASK_SUBMIT:
      return startQueuedTaskSubmit(state, action)

    /*
      TODO - doc
    */
    case STOP_QUEUED_TASK_SUBMIT:
      return stopQueuedTaskSubmission(state, action)

    /*
      TODO - doc
    */
    case START_TASK_SYNC:
      return startTaskSync(state, action)

    /*
      TODO - doc
    */
    case END_TASK_SYNC:
      return endTaskSync(state, action)

    /*
     TODO - doc
    */
    case SYNC_TASKS:
      return syncTasks(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_TASK:
      return addTask(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_TASKS:
      return addTasks(state, action)

    /*
      TODO - doc
    */
    case DELETE_ALL_TASKS:
      return deleteAllTasks(state, action)

    /*
      TODO - doc
    */
    case DELETE_TASK:
      return deleteTask(state, action)

    /*
      TODO - doc
    */
    case ADD_PENDING_TASK_DELETE:
      return addPendingTaskDelete(state, action)

    /*
      TODO - doc
    */
    case ADD_PENDING_TASK_UPDATE:
      return addPendingTaskUpdate(state, action)

    /*
      TODO - doc
    */
    case ADD_PENDING_TASK_CREATE:
      return addPendingTaskCreate(state, action)

    /*
      TODO - doc
    */
    case REMOVE_PENDING_TASK_DELETE:
      return removePendingTaskDelete(state, action)

    /*
      TODO - doc
    */
    case REMOVE_PENDING_TASK_UPDATE:
      return removePendingTaskUpdate(state, action)

    /*
      TODO - doc
    */
    case REMOVE_PENDING_TASK_CREATE:
      return removePendingTaskCreate(state, action)

    default:
      return state
  }
}

export default tasksReducer