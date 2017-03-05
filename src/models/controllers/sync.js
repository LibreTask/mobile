/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

import * as TaskStorage from '../storage/task-storage'
import * as ListStorage from '../storage/list-storage'
import * as ProfileStorage from '../storage/profile-storage'

// TODO - move this method to general-purpose file
async function getState() {

  let tasks = {}
  let lists = {}
  let profile = {}
  let isLoggedIn = false

  try {
    let tasksHash = await TaskStorage.getAllTasks()
    var taskIds = Object.keys(tasksHash)
    tasks = taskIds.map(function(id) { return tasksHash[id]; })
  } catch (err) { /* ignore */ }

  try {
    let listsHash = await ListStorage.getAllLists()
    var listIds = Object.keys(listsHash)
    lists = listIds.map(function(id) { return listsHash[id]; })
  } catch (err) { /* ignore */ }

  try {
    profile = await ProfileStorage.getMyProfile()
  } catch (err) { /* ignore */ }

  try {
    isLoggedIn = await ProfileStorage.isLoggedIn()
  } catch (err) { /* ignore */ }

  return {
    entities: {
      tasks: tasks,
      lists: lists
    },
    user: {
      profile: profile,
      isLoggedIn: isLoggedIn
    }
  }
}

export const sync = async () => {

  const state = await getState()

  if (!state.user.isLoggedIn) {
    return;
  }

  const userId = state.user.profile.id
  const password = state.user.profile.password

  const request = {
    endpoint: 'sync/client-state',
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       myState: state
     })
  }

  return invoke(request)
  .then( response => response.json())
  .then( response => {

    // TODO - log / inspect object / persist if necessary

    if (response.state.entities.lists
        && response.state.entities.lists.length > 0) {
      ListStorage.createOrUpdateLists(response.state.entities.lists)
    }

    if (response.state.entities.tasks
        && response.state.entities.tasks.length > 0) {
      TaskStorage.createOrUpdateTasks(response.state.entities.tasks)
    }

    if (response.state.user && response.state.user.profile) {

      // TODO - better handling of PW
      const profile = Object.assign({}, response.state.user.profile, {
        password: password
      })

      ProfileStorage.createOrUpdateProfile(profile)
    }

    /**
     * The response should contain a list attribute
     */
    return response
  })
}
