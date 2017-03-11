/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  CREATE_OR_UPDATE_LIST,
  CREATE_OR_UPDATE_LISTS,
  DELETE_ALL_LISTS,
  DELETE_LIST
} from '../../actions/entities/list'
import { SYNC } from '../../actions/sync'
import {
  updateObject,
  createReducer,
} from '../reducer-utils'

import * as _ from 'lodash'

function deleteAllLists(state, action) {
  return {}
}

function deleteList(state, action) {
  return _.filter(state, function(list) {
    return list.id !== action.listId // filter out listId
  })
}

function addLists(state, action) {
  let normalizedLists = {}
  _.forEach(action.lists, (list) => {
    normalizedLists[list.id] = list;
  })
  return updateObject(state, normalizedLists)
}

function addList(state, action) {
  return addNormalizedList(state, action.list)
}

function addNormalizedList(state, normalizedList) {

  let updatedListEntry = {}
  updatedListEntry[normalizedList.id] = normalizedList;

  return updateObject(state, updatedListEntry)
}

function syncLists(state, action) {

  return (action.lists && action.lists.length > 0)
    ? addLists(state, action)
    : state;
}

const initialState = {
  // listId: {public list attributes}
}

function listsReducer(state = initialState, action) {
  switch(action.type) {

    /*
     TODO - doc
    */
    case SYNC:
      return syncLists(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_LIST:
      return addList(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_LISTS:
      return addLists(state, action)

    /*
      TODO - doc
    */
    case DELETE_LIST:
      return deleteList(state, action)

    /*
      TODO - doc
    */
    case DELETE_ALL_LISTS:
      return deleteAllLists(state, action)

    default:
      return state;
  }
}

export default listsReducer;
