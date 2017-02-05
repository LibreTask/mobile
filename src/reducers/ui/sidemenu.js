/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import {
  SIDEMENU_TOGGLE,
  SIDEMENU_OPEN,
  SIDEMENU_CLOSE,
  SIDEMENU_TOGGLE_LISTS,
  SIDEMENU_EXPAND_LISTS,
  SIDEMENU_COLLAPSE_LISTS
} from '../../actions/sidemenu'

const initialState = {
  isOpen: false,
  isListsViewCollapsed: false,
  disableGestures: false,
}

export default function sideMenuReducer(state = initialState, action) {
  switch (action.type) {
    case SIDEMENU_TOGGLE:
      return {
        ...state,
        isOpen: !state.isOpen
      }
    case SIDEMENU_OPEN:
      return {
        ...state,
        isOpen: true
      }
    case SIDEMENU_CLOSE:
      return {
        ...state,
        isOpen: false
      }
    case SIDEMENU_TOGGLE_LISTS:
      return {
        ...state,
        isListsViewCollapsed: !state.isListsViewCollapsed
      }
    case SIDEMENU_EXPAND_LISTS:
      return {
        ...state,
        isListsViewCollapsed: false
      }
    case SIDEMENU_COLLAPSE_LISTS:
      return {
        ...state,
        isListsViewCollapsed: true
      }
    default:
      return state
  }
}
