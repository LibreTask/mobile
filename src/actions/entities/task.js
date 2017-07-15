/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import * as TaskController from "../../models/controllers/task";
import * as UserController from "../../models/controllers/user";

import * as TaskQueue from "../../models/storage/task-queue";
import * as TaskStorage from "../../models/storage/task-storage";

import DateUtils from "../../utils/date-utils";

export const CREATE_OR_UPDATE_TASK = "CREATE_OR_UPDATE_TASK";

export const createOrUpdateTask = task => {
  return {
    type: CREATE_OR_UPDATE_TASK,
    task: task
  };
};

export const DELETE_TASK = "DELETE_TASK";

export const deleteTask = taskId => {
  return {
    type: DELETE_TASK,
    taskId: taskId
  };
};

export const DELETE_ALL_TASKS = "DELETE_ALL_TASKS";

export const deleteAllTasks = () => {
  return {
    type: DELETE_ALL_TASKS
  };
};

export const START_TASK_SYNC = "START_TASK_SYNC";

export const startTaskSync = intervalId => {
  return {
    type: START_TASK_SYNC,
    intervalId: intervalId
  };
};

export const END_TASK_SYNC = "END_TASK_SYNC";

export const endTaskSync = () => {
  return {
    type: END_TASK_SYNC
  };
};

export const SYNC_TASKS = "SYNC_TASKS";

export const syncTasks = () => {
  return function(dispatch, getState) {
    console.log("sync task state...");
    //////console.dir(getState());

    let user = getState().entities.user;

    // only sync if the user can access the network
    if (user && UserController.canAccessNetwork(user.profile)) {
      // if no successful sync has been recorded, sync entire last month
      let lastSuccessfulSyncDateTimeUtc =
        getState().entities.task.lastSuccessfulSyncDateTimeUtc ||
        DateUtils.lastMonth(); // TODO - refine approach

      // sync all new updates
      return TaskController.syncTasks(lastSuccessfulSyncDateTimeUtc)
        .then(response => {
          // After the Sync, let the reducer handle what Tasks to
          // update/create/delete. Here are are simply passing all
          // the sync data to the Reducer, without performing any
          // logic on it.
          dispatch({
            type: SYNC_TASKS,
            tasks: response && response.tasks ? response.tasks : [],

            // set 'lastSync' time as five minutes ago, to provide small buffer
            lastSuccessfulSyncDateTimeUtc: DateUtils.fiveMinutesAgo()
          });
        })
        .catch(error => {
          console.log("sync error: " + error);
          ////console.dir(error);
        });
    }
  };
};

export const START_QUEUED_TASK_SUBMIT = "START_QUEUED_TASK_SUBMIT";

export const startQueuedTaskSubmit = intervalId => {
  return {
    type: START_QUEUED_TASK_SUBMIT,
    intervalId: intervalId
  };
};

export const STOP_QUEUED_TASK_SUBMIT = "STOP_QUEUED_TASK_SUBMIT";

export const stopQueuedTaskSubmission = () => {
  return {
    type: STOP_QUEUED_TASK_SUBMIT
  };
};

export const submitQueuedTasks = () => {
  return function(dispatch, getState) {
    console.log("queued task submit state...");
    ////console.dir(getState());

    const profile = getState().entities.user.profile;

    // only submit queued tasks if the user can access the network
    if (UserController.canAccessNetwork(profile)) {
      const pendingTaskActions = getState().entities.task.pendingTaskActions;
      const userId = profile.id;
      const password = profile.password;

      console.log("pending create...");
      ////console.dir(pendingTaskActions.create);

      for (let taskId in pendingTaskActions.create) {
        let task = pendingTaskActions.create[taskId];

        TaskController.createTaskFromQueue(task, userId, password)
          .then(response => {
            /*
            Each task has a unique identifier that is assigned by the server.
            However, when the server cannot be reached, the client will queue
            the task creation and temporarily assign an id.

            This code handles the case when a queued task has its temporary id
            replaced with the permanent, server-assigned id.
          */

            // delete both versions of task that have outdated id
            TaskQueue.dequeueTaskByTaskId(task.id);
            TaskStorage.deleteTaskByTaskId(task.id);

            dispatch({
              type: REMOVE_PENDING_TASK_CREATE,
              taskId: task.id,
              serverAssignedTaskId: response.task.id
            });
          })
          .catch(error => {
            console.log("create task queue error....");
            ////console.dir(error);
          });
      }

      console.log("pending update...");
      ////console.dir(pendingTaskActions.update);

      for (let taskId in pendingTaskActions.update) {
        let task = pendingTaskActions.update[taskId];

        TaskController.updateTaskFromQueue(task, userId, password)
          .then(response => {
            TaskQueue.dequeueTaskByTaskId(task.id);

            dispatch({
              type: REMOVE_PENDING_TASK_UPDATE,
              taskId: task.id
            });
          })
          .catch(error => {
            console.log("update task queue error....");
            ////console.dir(error);
          });
      }

      console.log("pending delete...");
      ////console.dir(pendingTaskActions.delete);

      for (let taskId in pendingTaskActions.delete) {
        let task = pendingTaskActions.delete[taskId];

        console.log("delete task form queue...");
        console.log("task...");
        console.dir(task);
        console.log("userid: " + userId);
        console.log("password: " + password);

        TaskController.deleteTaskFromQueue(task, userId, password)
          .then(response => {
            TaskQueue.dequeueTaskByTaskId(task.id);

            dispatch({
              type: REMOVE_PENDING_TASK_DELETE,
              taskId: task.id
            });
          })
          .catch(error => {
            console.log("delete task queue error....");
            ////console.dir(error);
          });
      }

      return;
    }
  };
};

export const START_TASK_CLEANUP = "START_TASK_CLEANUP";

export const startTaskCleanup = intervalId => {
  return {
    type: START_TASK_CLEANUP,
    intervalId: intervalId
  };
};

export const STOP_TASK_CLEANUP = "STOP_TASK_CLEANUP";

export const stopTaskCleanup = () => {
  return {
    type: STOP_TASK_CLEANUP
  };
};

export const cleanupTasks = () => {
  /*
    This method has much room for improvement. Currently we dereference a task
    if it was completed or deleted later than yesterday.
  */
  let cleanupTask = task => {
    if (
      task.isCompleted &&
      task.completionDateTimeUtc < DateUtils.yesterday()
    ) {
      return true;
    }

    if (task.isDeleted && task.updatedAtDateTimeUtc < DateUtils.yesterday()) {
      return true;
    }

    return false;
  };

  return function(dispatch, getState) {
    const pendingTaskActions = getState().entities.task.pendingTaskActions;
    const tasks = getState().entities.task.tasks || {};

    for (let taskId in tasks) {
      let task = tasks[taskId];

      if (cleanupTask(task)) {
        TaskStorage.deleteTaskByTaskId(task.id);

        dispatch({
          type: DELETE_TASK,
          taskId: task.id
        });
      }
    }

    let pendingUpdates = pendingTaskActions.update || {};
    for (let taskId in pendingUpdates) {
      let task = pendingTaskActions.update[taskId];

      if (cleanupTask(task)) {
        TaskQueue.dequeueTaskByTaskId(task.id);

        dispatch({
          type: REMOVE_PENDING_TASK_UPDATE,
          taskId: task.id
        });
      }
    }

    let pendingCreates = pendingTaskActions.create || {};
    for (let taskId in pendingCreates) {
      let task = pendingTaskActions.create[taskId];

      if (cleanupTask(task)) {
        TaskQueue.dequeueTaskByTaskId(task.id);

        dispatch({
          type: REMOVE_PENDING_TASK_CREATE,
          taskId: task.id
        });
      }
    }

    let pendingDeletes = pendingTaskActions.delete || {};
    for (let taskId in pendingDeletes) {
      let task = pendingTaskActions.delete[taskId];

      if (cleanupTask(task)) {
        TaskQueue.dequeueTaskByTaskId(task.id);

        dispatch({
          type: REMOVE_PENDING_TASK_DELETE,
          taskId: task.id
        });
      }
    }

    return;
  };
};

/******************************************************************************/

// TODO - do not let the "pendingTask" object exceed a certain threshold.
// otherwise, the memory footprint has no upper boundary.

/*
Invoked when a task create/update/delete could not reach the server.
Mark it as "pending" and wait until the next available submission opportunity.
*/
export const ADD_PENDING_TASK_CREATE = "ADD_PENDING_TASK_CREATE";
export const ADD_PENDING_TASK_UPDATE = "ADD_PENDING_TASK_UPDATE";
export const ADD_PENDING_TASK_DELETE = "ADD_PENDING_TASK_DELETE";
export const REMOVE_PENDING_TASK_CREATE = "REMOVE_PENDING_TASK_CREATE";
export const REMOVE_PENDING_TASK_UPDATE = "REMOVE_PENDING_TASK_UPDATE";
export const REMOVE_PENDING_TASK_DELETE = "REMOVE_PENDING_TASK_DELETE";

export const addPendingTaskCreate = task => {
  return {
    type: ADD_PENDING_TASK_CREATE,
    task: task
  };
};

export const addPendingTaskUpdate = task => {
  return {
    type: ADD_PENDING_TASK_UPDATE,
    task: task
  };
};

export const addPendingTaskDelete = task => {
  return {
    type: ADD_PENDING_TASK_DELETE,
    task: task
  };
};

export const removePendingTaskCreate = taskId => {
  return {
    type: REMOVE_PENDING_TASK_CREATE,
    taskId: taskId
  };
};

export const removePendingTaskUpdate = taskId => {
  return {
    type: REMOVE_PENDING_TASK_UPDATE,
    taskId: taskId
  };
};

export const removePendingTaskDelete = taskId => {
  return {
    type: REMOVE_PENDING_TASK_DELETE,
    taskId: taskId
  };
};

/******************************************************************************/
