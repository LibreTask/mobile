/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  CREATE_OR_UPDATE_TASK,
  CREATE_OR_UPDATE_TASKS,
  DELETE_ALL_TASKS,
  DELETE_TASK
} from '../../actions/entities/task'
import { SYNC } from '../../actions/sync'
import {
  updateObject,
  createReducer,
} from '../reducer-utils'

import * as _ from 'lodash'

function deleteAllTasks(state, action) {
  return {}
}

function deleteTask(state, action) {
  let remainingTasks = _.filter(state, function(task) {
    return task.id !== action.taskId // filter out taskId
  })

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  return taskMap
}

function addTasks(state, action) {
  let normalizedTasks = {}
  _.forEach(action.tasks, (task) => {
    normalizedTasks[task.id] = task;
  })
  return updateObject(state, normalizedTasks)
}

function addTask(state, action) {
  return addNormalizedTask(state, action.task)
}

function addNormalizedTask(state, normalizedTask) {

  let updatedTaskEntry = {}
  updatedTaskEntry[normalizedTask.id] = normalizedTask;

  return updateObject(state, updatedTaskEntry)
}

function syncTasks(state, action) {

  return (action.tasks && action.tasks.length > 0)
    ? addTasks(state, action)
    : state;
}

const initialState = {
  // taskId: {public task attributes}
}

function tasksReducer(state = initialState, action) {
  switch(action.type) {

    /*
     TODO - doc
    */
    case SYNC:
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

    default:
      return state;
  }
}

export default tasksReducer;
