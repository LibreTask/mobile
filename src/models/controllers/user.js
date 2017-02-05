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
    endpoint: `user/get-by-id/${userId}`,
    method: 'GET',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       id: userId,
       password: password,
     })
  }

  return invoke(request)
}

export const upgradeAccount = (userId, password) => {

  const request = {
    endpoint: `user/upgrade-account`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       id: userId,
       password: password,
     })
  }

  return invoke(request)
}

export const downgradeAccount = (userId, password) => {
  const request = {
    endpoint: `user/downgrade-account`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       id: userId,
       password: password,
     })
  }

  return invoke(request)
}
