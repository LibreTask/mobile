/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import DateUtils from "./date-utils";

const TaskUtils = {
  shouldRenderTask: function(task, showCompletedTasks = false) {
    if (!task) return false;

    if (task.isDeleted) return false; // do not display deleted tasks

    if (task.isCompleted) {
      // continue if, for some reason, we do not have the date recorded
      if (!task.completionDateTimeUtc) return false;

      // only display completed tasks less than one day ago
      if (new Date(task.completionDateTimeUtc) < DateUtils.yesterday()) {
        return false;
      }

      // do not display the completed task, unless the
      // showCompletedTasks flag is set to true
      if (!showCompletedTasks) return false;
    }

    return true;
  }
};

module.exports = TaskUtils;
