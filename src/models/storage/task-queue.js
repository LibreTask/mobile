/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

/*
  This module serves as a persistent queue for task operations.

  Not all task operations are queued, only those that could not originally
  reach the server. Note that tasks should live in the queue as briefly as
  possible; a separate background process has the sole job of clearing the
  queue.
*/

import * as _ from "lodash";

import { AsyncStorage } from "react-native";

const UPDATE = "UPDATE";
const DELETE = "DELETE";
const CREATE = "CREATE";

export async function getQueuedTaskByTaskId(taskId) {
  return await AsyncStorage.getItem(`queue/task${taskId}`);
}

export async function getHashOfTasksByOperation(operation) {
  const allKeys = await AsyncStorage.getAllKeys();
  let tasks = {};

  for (let key of allKeys) {
    if (key.indexOf("queue/task") !== -1) {
      let task = JSON.parse(await AsyncStorage.getItem(key));

      if (task.operation === operation) {
        tasks[task.id] = task;
      }
    }
  }

  return tasks;
}

export async function getAllPendingUpdates() {
  return await getHashOfTasksByOperation(UPDATE);
}

export async function getAllPendingDeletes() {
  return await getHashOfTasksByOperation(DELETE);
}

export async function getAllPendingCreates() {
  return await getHashOfTasksByOperation(CREATE);
}

export function queueTaskCreate(task) {
  return _upsertTask(task, CREATE);
}

export function queueTaskUpdate(task) {
  return _upsertTask(task, UPDATE);
}

export function queueTaskDelete(task) {
  return _upsertTask(task, DELETE);
}

function _upsertTask(task, operation) {
  task.operation = operation;

  return AsyncStorage.setItem(`queue/task/${task.id}`, JSON.stringify(task));
}

export function dequeueTaskByTaskId(taskId) {
  return AsyncStorage.removeItem(`queue/task/${taskId}`);

  // TODO - we should instead update the "deletion status"
}

export function cleanTaskQueue() {
  // TODO - refine deletion
  AsyncStorage.clear();
}
