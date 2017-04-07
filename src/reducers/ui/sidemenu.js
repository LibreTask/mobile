/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import {
  SIDEMENU_TOGGLE,
  SIDEMENU_OPEN,
  SIDEMENU_CLOSE,
} from '../../actions/sidemenu'

const initialState = {
  isOpen: false,
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
    default:
      return state
  }
}
