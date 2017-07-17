/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const SIDEMENU_TOGGLE = "SIDEMENU_TOGGLE";

export const toggleSideMenu = () => {
  return {
    type: SIDEMENU_TOGGLE
  };
};

export const SIDEMENU_OPEN = "SIDEMENU_OPEN";

export const openSideMenu = () => {
  return {
    type: SIDEMENU_OPEN
  };
};

export const SIDEMENU_CLOSE = "SIDEMENU_CLOSE";

export const closeSideMenu = () => {
  return {
    type: SIDEMENU_CLOSE
  };
};

export const UPDATE_HIGHLIGHT = "UPDATE_HIGHLIGHT";
export const TASKS_LINK = "TASKS_LINK";
export const PROFILE_LINK = "PROFILE_LINK";
export const ABOUT_LINK = "ABOUT_LINK";

export const updateHighlight = currentHighlightedLink => {
  return {
    type: UPDATE_HIGHLIGHT,
    currentHighlightedLink: currentHighlightedLink
  };
};
