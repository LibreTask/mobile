/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  START_SYNC,
  END_SYNC,
  SYNC
} from '../actions/sync'
import {
  updateObject,
  createReducer,
} from './reducer-utils'

import * as _ from 'lodash'

function startSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    intervalId: action.intervalId
  })
}

function endSync(state, action) {
  clearInterval(state.intervalId) // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    intervalId: undefined
  })
}

const initialState = {
  isSyncing: false,
  intervalId: undefined // used to cancel sync
};

function syncReducer(state = initialState, action) {
  switch(action.type) {

    /*
      TODO - doc
    */
    case START_SYNC:
      return startSync(state, action);

    /*
      TODO - doc
    */
    case END_SYNC:
      return endSync(state, action);

    default:
      return state;
  }
}

export default syncReducer;
