/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import {
  COLLAPSE_CATEGORY,
  SHOW_CATEGORY,
  TOGGLE_CATEGORY,
  TODAYS_TASKS,
  TOMORROWS_TASKS,
  FUTURE_TASKS,
  OVERDUE_TASKS,
  TASKS_WITH_NO_DATE,
  REFRESH_TASK_VIEW,
  STOP_REFRESH_TASK_VIEW
} from "../../actions/ui/taskview";
import { updateObject } from "../reducer-utils";

const initialState = {
  shouldRefreshTaskView: false,
  lastTaskViewRefreshDate: undefined
};
initialState[TODAYS_TASKS] = { isCollapsed: false };
initialState[TOMORROWS_TASKS] = { isCollapsed: true };
initialState[FUTURE_TASKS] = { isCollapsed: true };
initialState[OVERDUE_TASKS] = { isCollapsed: true };
initialState[TASKS_WITH_NO_DATE] = { isCollapsed: true };

export default function taskviewReducer(state = initialState, action) {
  switch (action.type) {
    case REFRESH_TASK_VIEW:
      return updateObject(state, {
        shouldRefreshTaskView: action.shouldRefreshTaskView,
        lastTaskViewRefreshDate: action.refreshDate
      });
    case COLLAPSE_CATEGORY:
      let collapsedCategory = {};
      collapsedCategory[action.category] = { isCollapsed: true };
      return updateObject(state, collapsedCategory);
    case SHOW_CATEGORY:
      let shownCategory = {};
      shownCategory[action.category] = { isCollapsed: false };
      return updateObject(state, shownCategory);
    case TOGGLE_CATEGORY:
      let toggledCategory = {};
      toggledCategory[action.category] = {
        isCollapsed: !state[action.category].isCollapsed
      };
      return updateObject(state, toggledCategory);
    default:
      return state;
  }
}
