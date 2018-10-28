/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import { combineReducers } from "redux";

import sideMenu from "./ui/sidemenu";
import taskview from "./ui/taskview";

import userReducer from "./entities/user";
import tasksReducer from "./entities/task";

const entitiesReducer = combineReducers({
  task: tasksReducer,
  user: userReducer
});

const uiReducer = combineReducers({
  sideMenu,
  taskview
});

const appReducer = combineReducers({
  ui: uiReducer,
  entities: entitiesReducer
});

const rootReducer = (state, action) => {
  if (action.type === "RESET") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
