/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

const CONSTANTS = {
  // links
  ACCOUNT_UPGRADE_LINK: 'https://www.algernon.io/profile/upgrade',
  ACCOUNT_DOWNGRADE_LINK: 'https://www.algernon.io/profile/downgrade',
  PASSWORD_RESET_LINK: 'https://login.uber.com/forgot-password',
  PRODUCT_PRIVACY_LINK: 'https://www.algernon.io/privacy',
  PRODUCT_TERMS_LINK: 'https://www.algernon.io/terms',
  WEBSITE_LINK: 'https://algernon.io',
  SOURCE_CODE_LINK: 'https://github.com/AlgernonLabs/mobile',

  LEFT_NAV_LOCATION: 'LEFT_NAV_LOCATION',
  MEDIUM_RIGHT_NAV_LOCATION: 'MEDIUM_RIGHT_NAV_LOCATION',
  FAR_RIGHT_NAV_LOCATION: 'FAR_RIGHT_NAV_LOCATION',

  APP_NAME: 'Algernon',

  // TODO - move these button constants to more appropriate location
  EDIT_NAVBAR_BUTTON: 'EDIT_NAVBAR_BUTTON',
  CREATE_NAVBAR_BUTTON: 'CREATE_NAVBAR_BUTTON',
  DELETE_NAVBAR_BUTTON: 'DELETE_NAVBAR_BUTTON',
  SAVE_NAVBAR_BUTTON: 'SAVE_NAVBAR_BUTTON',
  BACK_NAVBAR_BUTTON: 'BACK_NAVBAR_BUTTON',
  MULTITASK_NAV_DROPDOWN: 'MULTITASK_NAV_DROPDOWN',

  INITIAL_WINDOW_HEIGHT: 370,
  INITIAL_WINDOW_WIDTH: 350,

  SYNC_INTERVAL_MILLIS: 30 * 1000, // 30 seconds
  QUEUED_TASK_SUBMISSION_INTERVAL_MILLIS: 60 * 1000, // 60 seconds

  // check each minute whether the taskview should be updated
  // note this is primarily used to update the TaskView at midnight
  TASKVIEW_REFRESH_CHECK_INTERVAL_MILLIS: 60 * 1000
}

module.exports = CONSTANTS;
