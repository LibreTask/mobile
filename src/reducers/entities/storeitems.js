/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
//import { } from '../../actions/api/store'
import {
  updateObject,
  createReducer,
  constructHashFromId
} from '../reducer-utils'

const initialState = {
  storeItems: {},
}

export const storeItemsReducer = createReducer(initialState, {

})
