/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export const EDIT_NAV_ACTION = 'EDIT_NAV_ACTION'
export const DELETE_NAV_ACTION = 'DELETE_NAV_ACTION'
export const SAVE_NAV_ACTION = 'SAVE_NAV_ACTION'

/*
 This is used when the navbar should communicate an action to children
 components. For example, if a user has clicked an "Edit List" or "Delete Task"
 button on the navbar, then the navAction could be "EDIT_LIST_NAV_ACTION" or
 "DELETE_TASK_NAV_ACTION", respectively. Then child components would consume
 this state, perform some action, and set navAction back to undefined.

 TODO - this approach seems unsatisfactory and indirect - can we do better?
*/
export function setNavAction(navAction = undefined) {
  return {
    type: 'SET_NAV_ACTION',
    navAction: navAction
  }
}

/*
 When rightButtonLocation === AppConstants.BACK_NAVBAR_BUTTON, then a
 transitionLocation is not used, because we simply hashHistory.goBack()
*/
export function setLeftNavButton(leftButton) {

  return {
    type: 'SET_LEFT_NAV_BUTTON',
    leftButton: leftButton,
  }
}

export function removeLeftNavButton() {
  return {
    type: 'REMOVE_LEFT_NAV_BUTTON',
    leftButton: null
  }
}

export function setMediumRightNavButton(rightButton) {

  return {
    type: 'SET_MEDIUM_RIGHT_NAV_BUTTON',
    mediumRightButton: rightButton,
  }
}

export function removeMediumRightNavButton() {
  return {
    type: 'REMOVE_MEDIUM_RIGHT_NAV_BUTTON',
    mediumRightButton: null
  }
}

/*
The default right navigation bar button is intended to be the 'far right' nav
button. If a secondary button is required, then use the 'medium right' button.
*/
export function setFarRightNavButton(rightButton) {

  return {
    type: 'SET_FAR_RIGHT_NAV_BUTTON',
    farRightButton: rightButton
  }
}

export function removeFarRightNavButton() {
  return {
    type: 'REMOVE_FAR_RIGHT_NAV_BUTTON',
    farRightButton: null
  }
}

export function setNavbarTitle(title) {
  return {
    type: 'SET_NAVBAR_TITLE',
    title: title
  }
}
