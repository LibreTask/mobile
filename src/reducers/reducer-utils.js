/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

export function updateObject(oldObject, newValues) {
  // TODO - should we use lodash merge instead of Object.assign?
  // import merge from "lodash/object/merge";

  // Encapsulate the idea of passing a new object as the first parameter
  // to Object.assign to ensure we correctly copy data instead of mutating
  return Object.assign({}, oldObject, newValues);
}

/*
  TODO - doc
*/
export function constructHashFromId(item) {
  // create clone so to not modify original
  let clonedItem = Object.assign({}, item);

  let itemId = clonedItem.id;
  delete clonedItem.id;

  let normalizedItem = {};
  normalizedItem[itemId] = clonedItem;

  return normalizedItem;
}
