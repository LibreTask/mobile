/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  CREATE_OR_UPDATE_PROFILE,
  DELETE_PROFILE
} from '../actions/entities/user'
import { SYNC } from '../actions/sync'
import { updateObject, createReducer } from './reducer-utils'

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

function syncProfile(state, action) {

  // if an update to profile is available, update, otherwise, ignore
  return (action.profile)
    ? addProfile(state, {profile: action.profile, isLoggedIn: true})
    : state;
}

const initialState = {
  profile: undefined,
  isLoggedIn: false
}

function userReducer(state = initialState, action) {
  switch (action.type) {

    /*
     TODO - doc
    */
    case SYNC:
      return syncProfile(state, action)

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
      return state;
  }
}

export default userReducer
