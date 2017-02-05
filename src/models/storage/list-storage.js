/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import { AsyncStorage } from 'react-native'
import * as ProfileStorage from './profile-storage'
import * as _ from 'lodash'

export async function getListByListId(listId) {
  return await AsyncStorage.getItem(`lists/${listId}`);
}

export async function getAllLists() {
  const allKeys = await AsyncStorage.getAllKeys();
  let lists = [];

  for (let key of allKeys) {
    if (key.indexOf('lists') !== -1) {
      let list = JSON.parse(await AsyncStorage.getItem(key))

      lists.push(list)
    }
  }

  return lists;
}

export async function getListsByUserId(userId) {
  const allKeys = await AsyncStorage.getAllKeys();
  let lists = [];

  for (let key of allKeys) {
    if (key.indexOf('lists') !== -1) {
      let list = JSON.parse(await AsyncStorage.getItem(key))

      if (list.ownerId === userId) {
        lists.push(list)
      }
    }
  }

  return lists;
}

export function createOrUpdateLists(lists) {
  for (let list of lists) {
    createOrUpdateList(list)
  }
}

export function createOrUpdateList(list) {
  return AsyncStorage.setItem(`lists/${list.id}`, JSON.stringify(list));
}

export function deleteListByListId(listId) {
  return AsyncStorage.removeItem(`lists/${listId}`);
}

export async function getMyLists() {
  // TODO - does this really make sense? should we just directly
  // get it from storage within the UI component? but that
  // would violate our hope to hide the storage layer
  // behind the controller layer

  // ALSO - should we really get the ProfileStorage object?

  //const myProfile = JSON.parse(await ProfileStorage.getMyProfile());

  //return await getListsByUserId(myProfile.id);

  return await getAllLists() // TODO - what if other person's lists on client???
}

export function cleanListStorage() {
  // TODO -
}
