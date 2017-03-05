/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const START_SYNC = 'START_SYNC'

export const startSync = (intervalId) => {

  return {
    type: START_SYNC,
    intervalId: intervalId
  }
}

export const END_SYNC = 'END_SYNC'

export const endSync = () => {

  return {
    type: END_SYNC,
  }
}

import * as SyncController from '../models/controllers/sync'

export const SYNC = 'SYNC'

export const sync = () => {

  return function(dispatch) {

    return SyncController.sync()
    .then( response => {

      let syncAction = {
        type: SYNC,
        lists: response.state.entities.lists,
        tasks: response.state.entities.tasks
      }

      if (response.state.user && response.state.user.profile) {
        syncAction.profile = response.state.user.profile
      }

      dispatch(syncAction)
    })
    .catch( error => {
      console.log('sync error....')
    })
  }
}
