/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const SET_RIGHT_NAV_BUTTON = 'SET_RIGHT_NAV_BUTTON'

export const setRightNavButton = (rightButtonLocation) => {
  return {
    type: SET_RIGHT_NAV_BUTTON,
    rightButton: rightButtonLocation
  }
}

export const REMOVE_RIGHT_NAV_BUTTON = 'REMOVE_RIGHT_NAV_BUTTON'

export const removeRightNavButton = () => {
  return {
    type: REMOVE_RIGHT_NAV_BUTTON,
    rightButton: null
  }
}
