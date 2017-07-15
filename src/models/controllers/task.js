/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from "../../middleware/api";

const uuidV4 = require("uuid/v4");

/*
  Only invoked when a Task need to be created client side, rather than server
  side. That is, when the client 1) has no network connection OR 2) is not
  logged in.
*/
export const constructTaskLocally = (
  taskName,
  taskNotes,
  taskDueDateTimeUtc
) => {
  const creationDateTimeUtc = new Date();

  return {
    name: taskName,
    notes: taskNotes,
    creationDateTimeUtc: creationDateTimeUtc,
    isCompleted: false,
    completionDateTimeUtc: undefined,

    // initially updateTime = creationTime
    updatedAtDateTimeUtc: creationDateTimeUtc,

    dueDateTimeUtc: taskDueDateTimeUtc,
    id: "client-task-" + uuidV4()
    // Notably, no userId is assigned because one may not exist.
    // A successful sync will rectify any discrepencies.
  };
};

export const createTaskFromQueue = (task, userId, password) => {
  return createTask(
    task.name,
    task.notes,
    task.dueDateTimeUtc,
    task.isCompleted,
    task.completionDateTimeUtc,
    userId,
    password
  );
};

export const createTask = (
  taskName,
  taskNotes,
  taskDueDateTimeUtc,
  isCompleted,
  completionDateTimeUtc,
  userId,
  password
) => {
  const request = {
    endpoint: `task/create`,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: constructAuthHeader(userId, password)
    },
    body: JSON.stringify({
      name: taskName,
      notes: taskNotes,
      dueDateTimeUtc: taskDueDateTimeUtc,

      /*
          It is possible to create a task that has already been completed.

          This scenario occurs when the client is unable to reach the server,
          and, consequently, the task has been created (and updated) LOCALLY.
          In other words, the CREATE + UPDATE is being bundled together here.
       */
      isCompleted: isCompleted ? true : false,
      completionDateTimeUtc: completionDateTimeUtc
    })
  };

  return invoke(request);
};

export const updateTaskFromQueue = (task, userId, password) => {
  return updateTask(task, userId, password);
};

export const updateTask = (task, userId, password) => {
  const request = {
    endpoint: `task/update`,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: constructAuthHeader(userId, password)
    },
    body: JSON.stringify({
      task: task
    })
  };

  return invoke(request);
};

export const deleteTaskFromQueue = (task, userId, password) => {
  return deleteTask(task.id, userId, password);
};

export const deleteTask = (taskId, userId, password) => {
  const request = {
    endpoint: `task/delete`,

    // POST because we do not immediately delete the Task.
    // The deletion must first be synced to all of the User's devices.
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: constructAuthHeader(userId, password)
    },
    body: JSON.stringify({
      taskId: taskId
    })
  };

  return invoke(request);
};

export const fetchTask = (taskId, userId, password) => {
  const request = {
    endpoint: `task/get-task-by-id/taskId=${taskId}`,
    schema: TaskSchema,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: constructAuthHeader(userId, password)
    }
  };

  return invoke(request);
};

export const syncTasks = async (lastSuccessfulSyncDateTimeUtc, user) => {
  console.log("state...");
  //console.dir(state);
  console.log("user: " + user);
  console.log("is logged in: " + user.isLoggedIn);

  if (!user || !user.isLoggedIn) {
    return;
  }

  // TODO - refine
  const isoDateTimeUtc = lastSuccessfulSyncDateTimeUtc.toISOString();

  const userId = user.profile.id;
  const password = user.profile.password;

  // TODO - pass in (and store) the actual date

  const endpoint = `task/sync-tasks-after-timestamp/timestamp=${isoDateTimeUtc}`;

  const request = {
    endpoint: endpoint,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: constructAuthHeader(userId, password)
    }
  };

  console.log("SYNC TASKS ENDPOINT: " + endpoint);

  return invoke(request)
    .then(response => {
      // TODO - log / inspect object / persist if necessary

      console.log("abc response...");
      //console.dir(response);

      /*

    if (response.tasks && response.length > 0) {
      TaskStorage.createOrUpdateTasks(response.state.entities.tasks)
    }

    */

      return response;
    })
    .catch(err => {
      console.log("task err...");
      //console.dir(err);
    });
};
