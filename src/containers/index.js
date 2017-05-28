/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { Provider } from "react-redux";

import configureStore from "../store/configureStore";
import App from "./App";

const store = configureStore();

// TODO - combine store with history (ie, the contents of AsyncStorage)

// Wrap App in Redux provider (makes Redux available to all sub-components)
export default class AppContainer extends Component {
  // TODO - infinite sync loop here?
  // TODO - be sure to clean up loop

  // what about marking items for deletion and then deleting when it's safe
  // updates and creation should not pose an issue, only deletes
  // because you could delete and _entity_ out from under a UI component

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
