/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const CREATE_OR_UPDATE_PROFILE = 'CREATE_OR_UPDATE_PROFILE'

export const createOrUpdateProfile = (profile) => {
  return {
    type: CREATE_OR_UPDATE_PROFILE,
    profile: profile,
    isLoggedIn: true
  }
}

export const DELETE_PROFILE = 'DELETE_PROFILE'

export const deleteProfile = () => {
  return {
    type: DELETE_PROFILE
  }
}
