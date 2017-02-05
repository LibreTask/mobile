/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const CREATE_OR_UPDATE_LIST = 'CREATE_OR_UPDATE_LIST'

export const createOrUpdateList = (list) => {
  return {
    type: CREATE_OR_UPDATE_LIST,
    list: list,
  }
}

export const CREATE_OR_UPDATE_LISTS = 'CREATE_OR_UPDATE_LISTS'

export const createOrUpdateLists = (lists) => {
  return {
    type: CREATE_OR_UPDATE_LISTS,
    lists: lists,
  }
}

export const DELETE_LIST = 'DELETE_LIST'

export const deleteList = (listId) => {
  return {
    type: DELETE_LIST,
    listId: listId
  }
}

export const DELETE_ALL_LISTS = 'DELETE_ALL_LISTS'

export const deleteAllLists = () => {
  return {
    type: DELETE_ALL_LISTS
  }
}
