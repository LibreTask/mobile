/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  CREATE_OR_UPDATE_PROFILE,
  DELETE_PROFILE,
  START_USER_SYNC,
  END_USER_SYNC,
  SYNC_USER
} from '../../actions/entities/user'
import { updateObject } from './../reducer-utils'

function startUserSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    intervalId: action.intervalId
  })
}

function endUserSync(state, action) {
  clearInterval(state.intervalId) // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    intervalId: undefined
  })
}

function deleteProfile(state, action) {
  return updateObject(state, {
    profile: undefined,
    isLoggedIn: false
  }) // on delete profile, wipe everything
}

function addProfile(state, action) {

  return updateObject(state, {
    profile: action.profile,
    isLoggedIn: action.isLoggedIn
  })
}

/*
  Always update lastSuccessfulSyncDateTimeUtc, because it is assumed that
  this reducer is ONLY invoked after a successful sync.
*/
function syncUser(state, action) {

  let updatedState = updateObject(state, {
    lastSuccessfulSyncDateTimeUtc: action.lastSuccessfulSyncDateTimeUtc
  })

  // if an update to profile is available, update, otherwise, ignore
  return (action.profile)
    ? updateObject(state, { profile: action.profile })
    : updateState
}

const initialState = {
  profile: undefined,
  isLoggedIn: false,
  isSyncing: false,
  lastSuccessfulSyncDateTimeUtc: undefined,
  intervalId: undefined, // used to cancel sync
}

function userReducer(state = initialState, action) {
  switch (action.type) {

    /*
      TODO - doc
    */
    case START_USER_SYNC:
      return startUserSync(state, action)

    /*
      TODO - doc
    */
    case END_USER_SYNC:
      return endUserSync(state, action)

    /*
     TODO - doc
    */
    case SYNC_USER:
      return syncUser(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_PROFILE:
      return addProfile(state, action)

    /*
      TODO - doc
    */
    case DELETE_PROFILE:
      return deleteProfile(state, action)

    default:
      return state
  }
}

export default userReducer
