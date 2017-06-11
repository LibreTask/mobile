/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { Text, View } from "react-native";

import configureStore from "../store/configureStore";
import App from "./App";

import * as TaskStorage from "../models/storage/task-storage";
import * as TaskQueue from "../models/storage/task-queue";
import * as ProfileStorage from "../models/storage/profile-storage";

/*
getInitialState().then(initialState => {
    const store = configureStore(initialState);

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    )
})
*/

// Wrap App in Redux provider (makes Redux available to all sub-components)
export default class AppContainer extends Component {
  // TODO - infinite sync loop here?
  // TODO - be sure to clean up loop

  // what about marking items for deletion and then deleting when it's safe
  // updates and creation should not pose an issue, only deletes
  // because you could delete and _entity_ out from under a UI component

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      initialState: undefined
    };
  }

  componentWillMount() {
    this.getInitialState().then(initialState => {
      this.setState({
        initialState: initialState,
        isLoading: false
      });
    });
  }

  async getInitialState() {
    let tasks = {};
    let queuedTaskCreates = {};
    let queuedTaskUpdates = {};
    let queuedTaskDeletes = {};
    let profile = {};
    let isLoggedIn = false;

    try {
      tasks = await TaskStorage.getHashOfAllTasks();
    } catch (err) {
      /* ignore */
    }

    try {
      queuedTaskUpdates = await TaskQueue.getAllPendingUpdates();
    } catch (err) {
      /* ignore */
    }

    try {
      queuedTaskCreates = await TaskQueue.getAllPendingCreates();
    } catch (err) {
      /* ignore */
    }

    try {
      queuedTaskDeletes = await TaskQueue.getAllPendingDeletes();
    } catch (err) {
      /* ignore */
    }

    try {
      profile = await ProfileStorage.getMyProfile();
    } catch (err) {
      /* ignore */
    }

    try {
      isLoggedIn = await ProfileStorage.isLoggedIn();
    } catch (err) {
      /* ignore */
    }

    return {
      entities: {
        task: {
          tasks: tasks,
          pendingTaskActions: {
            update: queuedTaskUpdates,
            delete: queuedTaskDeletes,
            create: queuedTaskCreates
          },
          isSyncing: false,
          syncIntervalId: undefined, // used to cancel sync
          lastSuccessfulSyncDateTimeUtc: undefined,
          isSubmittingQueuedTasks: false,
          queuedTaskSubmitIntervalId: undefined
        },
        user: {
          profile: profile,
          isLoggedIn: isLoggedIn,
          isSyncing: false,
          lastSuccessfulSyncDateTimeUtc: undefined,
          intervalId: undefined // used to cancel sync
        }
      }
      // TODO - UI elements?
    };
  }

  render() {
    if (this.state.isLoading) {
      // TODO - improve here

      return (
        <View>
          <Text>
            Loading...
          </Text>
        </View>
      );
    } else {
      let initialState = this.state.initialState;

      // TODO - release memory
      //  this.setState({initialState: undefined})

      let store = configureStore(initialState);

      return (
        <Provider store={store}>
          <App />
        </Provider>
      );
    }
  }
}
