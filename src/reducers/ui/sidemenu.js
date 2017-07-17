/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import {
  SIDEMENU_TOGGLE,
  SIDEMENU_OPEN,
  SIDEMENU_CLOSE,
  UPDATE_HIGHLIGHT,
  TASKS_LINK
} from "../../actions/ui/sidemenu";
import { updateObject } from "../reducer-utils";

const initialState = {
  isOpen: false,
  disableGestures: false,
  currentHighlightedLink: TASKS_LINK
};

export default function sideMenuReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_HIGHLIGHT:
      return updateObject(state, {
        currentHighlightedLink: action.currentHighlightedLink
      });
    case SIDEMENU_TOGGLE:
      return {
        ...state,
        isOpen: !state.isOpen
      };
    case SIDEMENU_OPEN:
      return {
        ...state,
        isOpen: true
      };
    case SIDEMENU_CLOSE:
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}
