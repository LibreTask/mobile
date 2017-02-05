/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const CREATE_OR_UPDATE_TASK = 'CREATE_OR_UPDATE_TASK'

export const createOrUpdateTask = (task) => {
  return {
    type: CREATE_OR_UPDATE_TASK,
    task: task,
  }
}

export const CREATE_OR_UPDATE_TASKS = 'CREATE_OR_UPDATE_TASKS'

export const createOrUpdateTasks = (tasks) => {
  return {
    type: CREATE_OR_UPDATE_TASKS,
    tasks: tasks
  }
}

export const DELETE_TASK = 'DELETE_TASK'

export const deleteTask = (taskId) => {
  return {
    type: DELETE_TASK,
    taskId: taskId
  }
}

export const DELETE_ALL_TASKS = 'DELETE_ALL_TASKS'

export const deleteAllTasks = () => {
  return {
    type: DELETE_ALL_TASKS
  }
}
