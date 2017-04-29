/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'

import sideMenu from './ui/sidemenu'
import taskview from './ui/taskview'

import userReducer from './user'
import tasksReducer from './entities/tasks'

const entitiesReducer = combineReducers({
  task: tasksReducer,
  user: userReducer
})

const uiReducer = combineReducers({
  sideMenu,
  taskview
})

const appReducer = combineReducers({
  ui: uiReducer,
  entities: entitiesReducer,
})

const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined;
  }

  return appReducer(state, action)
}

export default rootReducer
