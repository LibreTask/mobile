/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import createLogger from "redux-logger";
import rootReducer from "../reducers";

const logger = createLogger();
const configureStore = preloadedState =>
  createStore(rootReducer, preloadedState, applyMiddleware(thunk, logger));

export default configureStore;
