/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import {
  BackAndroid,
  NetInfo,
  Text,
  View,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { connect } from "react-redux";
import { Navigator } from "react-native-deprecated-custom-components";
import SideMenu from "react-native-side-menu";

import * as _ from "lodash";

import * as SideMenuActions from "../actions/ui/sidemenu";
import * as UserController from "../models/controllers/user";

import * as TaskViewActions from "../actions/ui/taskview";

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
      this.props.syncTasks(); // call once at start, then begin to poll

      let intervalId = setInterval(() => {
        this.props.syncTasks();

        // refresh task view after each sync
        this.props.refreshTaskViewCollapseStatus();
      }, AppConstants.SYNC_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startTaskSync(intervalId);
    }
  };

  _startProfileSync = () => {
    if (!this.props.isSyncingUser) {
      this.props.syncUser(); // call once at start, then begin to poll

      let intervalId = setInterval(() => {
        this.props.syncUser();
      }, AppConstants.SYNC_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startUserSync(intervalId);
    }
  };

  _startSubmissionOfQueuedTasks = () => {
    if (!this.props.isSubmittingQueuedTasks) {
      this.props.submitQueuedTasks(); // call once at start, then begin to poll

      let intervalId = setInterval(() => {
        this.props.submitQueuedTasks();
      }, AppConstants.QUEUED_TASK_SUBMISSION_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startQueuedTaskSubmit(intervalId);
    }
  };

  _startTaskCleanup = () => {
    if (!this.props.isCleaningUpTasks) {
      this.props.cleanupTasks(); // call once at start, then begin to poll

      let intervalId = setInterval(() => {
        this.props.cleanupTasks();
      }, AppConstants.TASK_CLEANUP_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startTaskCleanup(intervalId);
    }
  };

  _startSubmissionOfQueuedProfileUpdates = () => {
    if (!this.props.isSubmittingQueuedProfileUpdates) {
      // call once at start, then begin to poll
      this.props.submitQueuedProfileUpdate();

      let intervalId = setInterval(() => {
        this.props.submitQueuedProfileUpdate();
      }, AppConstants.QUEUED_PROFILE_SUBMISSION_INTERVAL_MILLIS);

      // register intervalId so we can cancel later
      this.props.startQueuedProfileSubmission(intervalId);
    }
  };

  _startUIRefreshCheck = () => {
    this.props.refreshTaskView(true); // call once at start, then begin to poll

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
    StatusBar.setHidden(false, "slide");
    StatusBar.setBackgroundColor(AppConfig.primaryColor, true);

    let navigator = this.refs.rootNavigator;

    BackAndroid.addEventListener("hardwareBackPress", () => {
      if (navigator && navigator.getCurrentRoutes().length > 1) {
        navigator.pop();
        return true;
      }

      if (this.props.sideMenuIsOpen) {
        this.props.closeSideMenu();
        return true;
      }

      return false;
    });

    this._startTaskSync();
    this._startProfileSync();
    this._startUIRefreshCheck();
    this._startSubmissionOfQueuedTasks();
    this._startTaskCleanup();
    this._startSubmissionOfQueuedProfileUpdates();

    // refresh task view at startup
    this.props.refreshTaskViewCollapseStatus();
  };

  componentWillUnmount() {
    this.props.endTaskSync();
    this.props.stopQueuedTaskSubmission();
    this.props.endUserSync();
    this.props.stopTaskViewRefresh();
    this.props.stopTaskCleanup();
    this.props.stopQueuedProfileSubmission();
  }

  componentWillUpdate(nextProps, nextState) {
    // hide StatusBar when the sidemenu is opened
    StatusBar.setHidden(nextProps.sideMenuIsOpen, "fade");
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props, nextProps)) {
      return true;
    }

    return false;
  }

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
    let navigatorStyle = this.props.sideMenuIsOpen
      ? [AppStyles.container, { opacity: 0.3 }]
      : [AppStyles.container];

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
          style={navigatorStyle}
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
  lastTaskViewRefreshDate: state.ui.taskview.lastTaskViewRefreshDate
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  closeSideMenu: SideMenuActions.closeSideMenu,
  createOrUpdateTasks: TaskActions.createOrUpdateTasks,
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  deleteAllTasks: TaskActions.deleteAllTasks,
  startQueuedProfileSubmission: UserActions.startQueuedProfileSubmission,
  stopQueuedProfileSubmission: UserActions.stopQueuedProfileSubmission,
  isSubmittingQueuedProfileUpdates:
    UserActions.isSubmittingQueuedProfileUpdates,
  submitQueuedProfileUpdate: UserActions.submitQueuedProfileUpdate,
  syncUser: UserActions.syncUser,
  startUserSync: UserActions.startUserSync,
  endUserSync: UserActions.endUserSync,
  syncUser: UserActions.syncUser,
  startTaskSync: TaskActions.startTaskSync,
  endTaskSync: TaskActions.endTaskSync,
  syncTasks: TaskActions.syncTasks,
  cleanupTasks: TaskActions.cleanupTasks,
  startTaskCleanup: TaskActions.startTaskCleanup,
  stopTaskCleanup: TaskActions.stopTaskCleanup,
  submitQueuedTasks: TaskActions.submitQueuedTasks,
  startQueuedTaskSubmit: TaskActions.startQueuedTaskSubmit,
  stopQueuedTaskSubmission: TaskActions.stopQueuedTaskSubmission,
  refreshTaskView: TaskViewActions.refreshTaskView,
  refreshTaskViewCollapseStatus: TaskViewActions.refreshTaskViewCollapseStatus,
  stopTaskViewRefresh: TaskViewActions.stopTaskViewRefresh
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
