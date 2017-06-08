/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import {
  Navigator,
  NetInfo,
  Text,
  View,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { connect } from "react-redux";
import SideMenu from "react-native-side-menu";

import * as _ from "lodash";

import * as SideMenuActions from "../actions/ui/sidemenu";
import * as UserController from "../models/controllers/user";

import * as ProfileStorage from "../models/storage/profile-storage";
import * as TaskStorage from "../models/storage/task-storage";

import * as TaskViewActions from "../actions/ui/taskview"

import * as UserActions from "../actions/entities/user";
import * as TaskActions from "../actions/entities/task";

import AppStyles from "../styles";
import AppConfig from "../config";
import AppConstants from "../constants";

import Menu from "../components/Menu";

import MultiTaskPage from "../components/screens/MultiTaskPage";

class AppContainer extends Component {

  _startTaskSync = () => {
    if (!this.props.isSyncingTasks) {
      let intervalId = setInterval(() => {
        this.props.syncTasks();
      }, AppConstants.SYNC_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startTaskSync(intervalId);
    }
  };

  _startProfileSync = () => {
    if (!this.props.isSyncingUser) {
      let intervalId = setInterval(() => {
        this.props.syncUser();
      }, AppConstants.SYNC_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startUserSync(intervalId);
    }
  };

  _startSubmissionOfQueuedTasks = () => {
    if (!this.props.isSubmittingQueuedTasks) {
      let intervalId = setInterval(() => {
        this.props.submitQueuedTasks();
      }, AppConstants.QUEUED_TASK_SUBMISSION_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startQueuedTaskSubmit(intervalId);
    }
  };

  _startTaskCleanup = () => {
    if (!this.props.isCleaningUpTasks) {
      let intervalId = setInterval(() => {
        this.props.cleanupTasks();
      }, AppConstants.TASK_CLEANUP_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startTaskCleanup(intervalId);
    }
  };

  _startUIRefreshCheck = () => {
    setInterval(() => {
      /*
        This is intended to update the TaskView once per day, at midnight

        TODO - refine this approach

        TODO - will we have a stale reference to `this`
      */
      let date = new Date().getDate();

      if (date !== this.props.lastTaskViewRefreshDate) {
        this.props.refreshTaskView(true);
      }
    }, AppConstants.TASKVIEW_REFRESH_CHECK_INTERVAL_MILLIS);
  };

  componentDidMount = async () => {
    StatusBar.setHidden(false, "slide"); // Slide in on load
    StatusBar.setBackgroundColor(AppConfig.primaryColor, true);

    //await this._loadInitialState();

    this._startTaskSync();
    this._startProfileSync();
    this._startUIRefreshCheck();
    this._startSubmissionOfQueuedTasks();
    this._startTaskCleanup();
  };

  componentWillUnmount() {
    this.props.stopTaskSync();
    this.props.stopQueuedTaskSubmission();
    this.props.stopUserSync();
    this.props.stopTaskViewRefresh();
    this.props.stopTaskCleanup();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props, nextProps)) {
      return true;
    }

    return false;
  }

  // TODO - move this logic to file like index.js
  _loadInitialState = async () => {
    let tasks = {};
    let profile = {};

    try {
      tasks = await TaskStorage.getAllTasks();
    } catch (err) {
      /* ignore */
    }

    try {
      profile = await ProfileStorage.getMyProfile();
    } catch (err) {
      /* ignore */
    }

    this.props.createOrUpdateTasks(tasks);

    // TODO - what else should we validate?
    if (profile) {
      this.props.createOrUpdateProfile(profile);
    }
  };

  _onSideMenuPress = (title, component, extraProps) => {
    this.props.closeSideMenu();

    this.refs.rootNavigator.popToTop();
    this.refs.rootNavigator.replace({
      title: title,
      component: component,
      index: 0,
      passProps: extraProps || {}
    });
  };

  _onSideMenuChange = isOpen => {
    if (isOpen != this.props.sideMenuIsOpen) {
      this.props.toggleSideMenu();
    }
  };

  _renderScene = (route, navigator) => {
    return (
      <View style={[AppStyles.container]}>
        <route.component
          navigator={navigator}
          route={route}
          {...route.passProps}
        />
      </View>
    );
  };

  render() {
    return (
      <SideMenu
        ref="rootSidebarMenu"
        menu={
          <Menu navigate={this._onSideMenuPress} ref="rootSidebarMenuMenu" />
        }
        disableGestures={this.props.sideMenuGesturesDisabled}
        isOpen={this.props.sideMenuIsOpen}
        onChange={this._onSideMenuChange}
      >

        <Navigator
          ref="rootNavigator"
          style={[AppStyles.container]}
          renderScene={this._renderScene}
          configureScene={function(route, routeStack) {
            if (route.transition == "FloatFromBottom")
              return Navigator.SceneConfigs.FloatFromBottom;
            else return Navigator.SceneConfigs.PushFromRight;
          }}
          initialRoute={{
            title: "All Tasks",
            component: MultiTaskPage,
            index: 0,
            navigator: this.refs.rootNavigator
          }}
        />

      </SideMenu>
    );
  }
}

const mapStateToProps = state => ({
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  isSyncingTasks: state.entities.task.isSyncingTasks,
  isSubmittingQueuedTasks: state.entities.task.isSubmittingQueuedTasks,
  isCleaningUpTasks: state.entities.task.isCleaningUpTasks,
  isSyncingUser: state.entities.user.isSyncing,
  showCompletedTasks: state.ui.taskview.showCompletedTasks,
  lastTaskViewRefreshDate: state.ui.taskview.lastTaskViewRefreshDate
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  closeSideMenu: SideMenuActions.closeSideMenu,
  createOrUpdateTasks: TaskActions.createOrUpdateTasks,
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  deleteAllTasks: TaskActions.deleteAllTasks,
  startUserSync: UserActions.startUserSync,
  stopUserSync: UserActions.stopUserSync,
  syncUser: UserActions.syncUser,
  startTaskSync: TaskActions.startTaskSync,
  stopTaskSync: TaskActions.stopTaskSync,
  syncTasks: TaskActions.syncTasks,
  cleanupTasks: TaskActions.cleanupTasks,
  startTaskCleanup: TaskActions.startTaskCleanup,
  stopTaskCleanup: TaskActions.stopTaskCleanup,
  submitQueuedTasks: TaskActions.submitQueuedTasks,
  startQueuedTaskSubmit: TaskActions.startQueuedTaskSubmit,
  stopQueuedTaskSubmission: TaskActions.stopQueuedTaskSubmission,
  refreshTaskView: TaskViewActions.refreshTaskView,
  stopTaskViewRefresh: TaskViewActions.stopTaskViewRefresh
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
