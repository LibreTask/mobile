/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import AppConstants from '../../constants'

const initialState = {
  navAction: undefined,
  farRightButton: null,
  farRightTransitionLocation: null,
  mediumRightButton: null,
  mediumRightTransitionLocation: null,
  leftButton: null,
  leftTransitionLocation: null,
  title: AppConstants.APP_NAME
}

export default function navbarReducer(state = initialState, action) {

  switch (action.type) {
    case 'SET_NAV_ACTION':
      return Object.assign({}, state, {
        navAction: action.navAction
      })
    case 'SET_MEDIUM_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        mediumRightButton: action.mediumRightButton,
      })
    case 'REMOVE_MEDIUM_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        mediumRightButton: null
      })
    case 'SET_FAR_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        farRightButton: action.farRightButton,
      })
    case 'REMOVE_FAR_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        farRightButton: null
      })
    case 'SET_LEFT_NAV_BUTTON':
      return Object.assign({}, state, {
        leftButton: action.leftButton,
      })
    case 'REMOVE_LEFT_NAV_BUTTON':
      return Object.assign({}, state, {
        leftButton: null
      })
    case 'SET_NAVBAR_TITLE':
      return Object.assign({}, state, {
        title: action.title
      })
    default:
      return state
  }
}
