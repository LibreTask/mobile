/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import { AsyncStorage } from "react-native";

import * as _ from "lodash";

export async function getHashOfAllTasks() {
  let taskHash = {};

  let tasks = await getAllTasks();

  for (let task of tasks) {
    taskHash[task.id] = task;
  }

  return taskHash;
}

export async function getAllTasks() {
  const allKeys = await AsyncStorage.getAllKeys();
  let tasks = [];

  for (let key of allKeys) {
    if (key.indexOf("tasks") !== -1) {
      let task = JSON.parse(await AsyncStorage.getItem(key));

      tasks.push(task);
    }
  }

  return tasks;
}

export async function getTaskByTaskId(taskId) {
  return await AsyncStorage.getItem(`tasks/${taskId}`);
}

export function createOrUpdateTasks(tasks) {
  for (let task of tasks) {
    createOrUpdateTask(task);
  }
}

export function createOrUpdateTask(task) {
  return AsyncStorage.setItem(`tasks/${task.id}`, JSON.stringify(task));
}

export function deleteTaskByTaskId(taskId) {
  return AsyncStorage.removeItem(`tasks/${taskId}`);
}

export function cleanTaskStorage() {
  // TODO - refine deletion
  AsyncStorage.clear();
}
