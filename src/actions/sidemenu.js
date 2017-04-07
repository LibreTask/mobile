/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const SIDEMENU_TOGGLE = 'SIDEMENU_TOGGLE'

export const toggleSideMenu = () => {
  return {
    type: SIDEMENU_TOGGLE
  }
}

export const SIDEMENU_OPEN = 'SIDEMENU_OPEN'

export const openSideMenu = () => {
  return {
    type: SIDEMENU_OPEN
  }
}

export const SIDEMENU_CLOSE = 'SIDEMENU_CLOSE'

export const closeSideMenu = () => {
  return {
    type: SIDEMENU_CLOSE
  }
}
