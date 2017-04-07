/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export const COLLAPSE_CATEGORY = 'COLLAPSE_CATEGORY'
export const SHOW_CATEGORY = 'SHOW_CATEGORY'
export const TOGGLE_CATEGORY = 'TOGGLE_CATEGORY'

export const TOGGLE_SHOW_COMPLETED_TASKS = 'TOGGLE_SHOW_COMPLETED_TASKS'

export const TODAYS_TASKS = 'TODAYS_TASKS'
export const TOMORROWS_TASKS = 'TOMORROWS_TASKS'
export const FUTURE_TASKS = 'FUTURE_TASKS'
export const OVERDUE_TASKS = 'OVERDUE_TASKS'
export const TASKS_WITH_NO_DATE = 'TASKS_WITH_NO_DATE'

export const toggleShowCompletedTasks = () => {
  return {
    type: TOGGLE_SHOW_COMPLETED_TASKS
  }
}

export const collapseCategory = (category) => {
  return alterCategory(COLLAPSE_CATEGORY, category)
}

export const showCategory = (category) => {
  return alterCategory(SHOW_CATEGORY, category)
}

export const toggleCategory = (category) => {
  return alterCategory(TOGGLE_CATEGORY, category)
}

/*
  This is intended to store the users preferences, so they do not have to
  continually collapse certain categories.
*/
const alterCategory = (type, category) => {
  return {
    type: type,
    category: category
  }
}
