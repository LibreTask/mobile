/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const COLLAPSE_CATEGORY = "COLLAPSE_CATEGORY";
export const SHOW_CATEGORY = "SHOW_CATEGORY";
export const TOGGLE_CATEGORY = "TOGGLE_CATEGORY";

export const REFRESH_TASK_VIEW = "REFRESH_TASK_VIEW";
export const STOP_REFRESH_TASK_VIEW = "END_REFRESH_TASK_VIEW";

export const TODAYS_TASKS = "TODAYS_TASKS";
export const TOMORROWS_TASKS = "TOMORROWS_TASKS";
export const FUTURE_TASKS = "FUTURE_TASKS";
export const OVERDUE_TASKS = "OVERDUE_TASKS";
export const TASKS_WITH_NO_DATE = "TASKS_WITH_NO_DATE";

import TaskUtils from "../../utils/task-utils";

/*
  This action enables "smart uncollapsing". It must be called _AFTER_ a task
  has been created/updated/deleted.

  After creating/updating/deleting a task, if only one task now remains, the
  first action a user will. take would be to un-collapse the task's view category. We are simply saving them that step here.
*/
export const refreshTaskViewCollapseStatus = () => {
  return function(dispatch, getState) {
    let user = getState().user;
    let showCompletedTasks =
      user && user.profile && user.profile.showCompletedTasks;

    const displayedTasks = _displayedTasks(
      getState().entities.task.tasks,
      showCompletedTasks
    );
    const taskCategories = getState().ui.taskview || {};

    if (displayedTasks && Object.keys(displayedTasks).length === 1) {
      let soleTask = displayedTasks[Object.keys(displayedTasks)[0]];

      // TODO - fix the hacky date logic in this method

      const taskDate = soleTask.dueDateTimeUtc
        ? new Date(soleTask.dueDateTimeUtc)
        : null;

      if (!taskDate) {
        if (taskCategories[TASKS_WITH_NO_DATE].isCollapsed) {
          dispatch(showCategory(TASKS_WITH_NO_DATE));
        }
      } else {
        const today = new Date();
        const tomorrow = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );

        if (
          taskDate.toDateString() === today.toDateString() &&
          taskCategories[TODAYS_TASKS].isCollapsed
        ) {
          dispatch(showCategory(TODAYS_TASKS));
        } else if (
          taskDate.toDateString() === tomorrow.toDateString() &&
          taskCategories[TOMORROWS_TASKS].isCollapsed
        ) {
          dispatch(showCategory(TOMORROWS_TASKS));
        } else if (
          taskDate.getTime() > tomorrow.getTime() &&
          taskCategories[FUTURE_TASKS].isCollapsed
        ) {
          dispatch(showCategory(FUTURE_TASKS));
        } else if (
          taskDate.getTime() < today.getTime() &&
          taskCategories[OVERDUE_TASKS].isCollapsed
        ) {
          dispatch(showCategory(OVERDUE_TASKS));
        } else {
          // TODO - what here?
        }
      }
    }
  };
};

const _displayedTasks = (tasks, showCompletedTasks) => {
  let displayedTasks = [];

  if (tasks && Object.keys(tasks).length) {
    for (let taskId in tasks) {
      if (TaskUtils.shouldRenderTask(tasks[taskId], showCompletedTasks)) {
        displayedTasks.push(tasks[taskId]);
      }
    }
  }

  return displayedTasks;
};

/*
  This is primarily intended to be used to refresh
  the TaskView each day at midnight.
*/
export const refreshTaskView = shouldRefresh => {
  return {
    type: REFRESH_TASK_VIEW,
    shouldRefreshTaskView: shouldRefresh,
    refreshDate: new Date().getDate() // TODO - refine
  };
};

export const stopTaskViewRefresh = () => {
  return {
    type: STOP_REFRESH_TASK_VIEW
  };
};

export const collapseCategory = category => {
  return alterCategory(COLLAPSE_CATEGORY, category);
};

export const showCategory = category => {
  return alterCategory(SHOW_CATEGORY, category);
};

export const toggleCategory = category => {
  return alterCategory(TOGGLE_CATEGORY, category);
};

/*
  This is intended to store the users preferences, so they do not have to
  continually collapse certain categories.
*/
const alterCategory = (type, category) => {
  return {
    type: type,
    category: category
  };
};
