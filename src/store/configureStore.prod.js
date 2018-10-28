/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../reducers";

const configureStore = preloadedState =>
  createStore(rootReducer, preloadedState, applyMiddleware(thunk));

export default configureStore;
