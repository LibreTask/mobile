/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { AsyncStorage } from "react-native";

export function queueProfileUpdate(profile) {
  // TODO - use encrypted storage for confidential information

  return AsyncStorage.setItem("queue/profile", JSON.stringify(profile));
}

export function deletedQueuedProfile() {
  return AsyncStorage.removeItem("queue/profile");
}

export async function getQueuedProfile() {
  let profile = await AsyncStorage.getItem("queue/profile");

  return JSON.parse(profile);
}

export function createOrUpdateProfile(profile) {
  // TODO - use encrypted storage for confidential information

  return AsyncStorage.setItem("profile", JSON.stringify(profile));
}

export function deleteProfile() {
  AsyncStorage.clear(); // for security, remove everything on profile deletion
}

export async function getMyProfile() {
  let profile = await AsyncStorage.getItem("profile");

  return JSON.parse(profile);
}

export function logout() {
  AsyncStorage.clear(); // for security, remove everything on logout
}

export async function isLoggedIn() {
  // TODO - refine this approach

  let profile = await getMyProfile();

  return profile !== null;
}

export function cleanProfileStorage() {
  // TODO -
}
