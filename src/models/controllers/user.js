/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

export const canAccessNetwork = (profile) => {
  return profile && profile.currentPlan === 'premium'
}

export const login = (email, password) => {

  const request = {
    endpoint: `user/login`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       email: email,
       password: password,
     })
  }

  return invoke(request)
}

export const signup = (email, password) => {

  const request = {
    endpoint: `user/signup`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       email: email,
       password: password,
     })
  }

  return invoke(request)
}

export const updateProfile = (profile) => {

  const request = {
    endpoint: `user/update`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(profile.id, profile.password)
     },
     body: JSON.stringify({
       profile: profile
     })
  }

  return invoke(request)
}


export const deleteProfile = (profile) => {

  const request = {
    endpoint: `user/delete`,
    method: 'DELETE',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(profile.id, profile.password)
     }
  }

  return invoke(request)
}

export const fetchProfile = (userId, password) => {

  const request = {
    endpoint: `user/get-profile-by-id/id=${userId}`,
    method: 'GET',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
  }

  return invoke(request)
}

import * as ProfileStorage from '../storage/profile-storage'

// TODO - move this method to general-purpose file
async function getState() {

  let profile = undefined
  let isLoggedIn = false

  try {
    profile = await ProfileStorage.getMyProfile()
  } catch (err) { /* ignore */ }

  try {
    isLoggedIn = await ProfileStorage.isLoggedIn()
  } catch (err) { /* ignore */ }

  return {
    user: {
      profile: profile,
      isLoggedIn: isLoggedIn
    }
  }
}

export const syncUser = async () => {

  const state = await getState()

  if (!state.entities.user.isLoggedIn) {
    return;
  }

  const userId = state.entities.user.profile.id
  const password = state.entities.user.profile.password

  return fetchProfile(userId, password)
  .then( response => {

    if (response.profile) {

      // TODO - refine password management scheme
      response.profile.password = password
      ProfileStorage.createOrUpdateProfile(response.profile)
    }

    return response
  })
  .catch( err => {
    // TODO
    console.log("user err...")
    console.dir(err)
  })
}
