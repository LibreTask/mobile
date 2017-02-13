/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'

import sideMenu from './ui/sidemenu'
import navbar from './ui/navbar'

import userReducer from './user'
import listsReducer from './entities/lists'
import tasksReducer from './entities/tasks'

import syncReducer from './sync'

const entitiesReducer = combineReducers({
  tasks: tasksReducer,
  lists: listsReducer,
});

const uiReducer = combineReducers({
  sideMenu,
  navbar
});

const appReducer = combineReducers({
  ui: uiReducer,
  entities: entitiesReducer,
  user: userReducer,
  sync: syncReducer
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer