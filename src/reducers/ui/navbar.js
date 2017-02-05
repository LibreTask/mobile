/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import {
  SET_RIGHT_NAV_BUTTON,
  REMOVE_RIGHT_NAV_BUTTON
} from '../../actions/navbar'

const initialState = {

  rightButton: null

  /*** No right button initially ***
  rightButton: {
    buttonIcon: 'pencil-square-o',
    onClickFunc: 'example', // a key that maps to actual function
    onClickArgs: {
      // ...
    }
  }
  */
}

export default function navbarReducer(state = initialState, action) {

  switch (action.type) {
    case SET_RIGHT_NAV_BUTTON:
      return Object.assign({}, state, {
        rightButton: action.rightButton
        /*

        TODO - expand to this functionality

        // we expand the action, rather than directly
        // assign rightButton, for improved clarity
        rightButton: {
          onClickFunc: action.rightButton.onClickFunc,
          onClickArgs: action.rightButton.onClickArgs,
          buttonIcon: action.rightButton.buttonIcon
        }
        */
      });
    case REMOVE_RIGHT_NAV_BUTTON:
    return Object.assign({}, state, {
      rightButton: null
    });
    default:
      return state
  }
}
