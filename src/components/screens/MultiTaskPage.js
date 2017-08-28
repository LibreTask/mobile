/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  DeviceEventEmitter,
  Image,
  ListView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { connect } from "react-redux";

import * as _ from "lodash";

import * as SideMenuActions from "../../actions/ui/sidemenu";
import * as TaskViewActions from "../../actions/ui/taskview";
import * as TaskActions from "../../actions/entities/task";
import * as TaskController from "../../models/controllers/task";
import * as UserController from "../../models/controllers/user";

import AppStyles from "../../styles";
import AppConfig from "../../config";
import AppConstants from "../../constants";
import DateUtils from "../../utils/date-utils";
import TaskUtils from "../../utils/task-utils";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import TaskRow from "../TaskRow";

import CreateTask from "./CreateTask";
import SingleTaskPage from "./SingleTaskPage";
import Settings from "./Settings";

class MultiTaskPage extends Component {
  static componentName = "MultiTaskPage";

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    let dataSource = new ListView.DataSource({
      // TODO - once ListView will re-render if the state has been updated
      // then we can properly set rowHasChanged by comparing the objects
      rowHasChanged: (row1, row2) => true
    });

    let tasks = this._filterTasksToDisplay(this.props.tasks);

    this.state = {
      isRefreshing: false,
      dataSource: dataSource.cloneWithRows(tasks)
    };
  }

  componentWillMount = () => {
    this.props.updateHighlight(SideMenuActions.TASKS_LINK);
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    if (!_.isEqual(this.props, nextProps)) {
      return true;
    }

    if (!_.isEqual(this.state, nextState)) {
      return true;
    }

    return false;
  };

  _filterTasksToDisplay = (tasks, showCompletedTasks) => {
    let tasksToDisplay = [];

    for (let taskId in tasks) {
      let task = tasks[taskId];

      if (TaskUtils.shouldRenderTask(task, showCompletedTasks)) {
        tasksToDisplay.push(task);
      }
    }

    return this._sortTasksByDateAndInsertHeaders(tasksToDisplay);
  };

  componentWillReceiveProps = nextProps => {
    let profile = nextProps.profile;
    let showCompletedTasks = profile && profile.showCompletedTasks;

    // must pass in all props that are used to refresh the screen
    this._refreshEntireList(nextProps.tasks, showCompletedTasks);
  };

  // TODO - reevaluate this solution;
  // it probably is a horrible misuse of React Native
  _refreshEntireList = (tasks, showCompletedTasks) => {
    let filteredTasks = this._filterTasksToDisplay(tasks, showCompletedTasks);
    this.setState({
      dataSource: new ListView.DataSource({
        /*
          TODO - Fix this stupid hack! Not safe for production.

          ReactNative's ListView behavior is such that an element is not
          re-rendered unless the function rowHasChanged returns true.
          That aspect of ListView makes our use-case extremely
          difficult to achieve.

          We want to update every element of the ListView if the state
          has changed. That seems like a simple ask, right? No! We do
          not store whether a task should be collapsed in the actual
          dataSource state object, because that leads to unnecessary
          duplication, especially if a category of tasks has many
          elements.

          Until a better fix is discovered, we will recreate the
          dataSource object so that a complete re-render is forced.
          To be precise, an ideal solution would be to completely
          remove this setState callback and still have the ListView
          update every element whenever the state is updated.

          Related:
          http://stackoverflow.com/questions/33436902/how-force-redraw-listview-when-this-state-changed-but-not-the-datasource
        */
        rowHasChanged: (row1, row2) => true
      }).cloneWithRows(filteredTasks)
    });
  };

  _sortTasksByDateAndInsertHeaders = tasks => {
    // TODO - fix the hacky date logic in this method

    const today = new Date();
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    let todaysTasks = [];
    let tomorrowsTasks = [];
    let futureTasks = [];
    let overdueTasks = [];
    let tasksWithNoDate = [];

    for (let task of tasks) {
      const taskDate = task.dueDateTimeUtc
        ? new Date(task.dueDateTimeUtc)
        : null;

      if (!taskDate) {
        task.displayCategory = "No Date";
        tasksWithNoDate.push(task);
      } else if (taskDate.toDateString() === today.toDateString()) {
        task.displayCategory = "Today";
        todaysTasks.push(task);
      } else if (taskDate.toDateString() == tomorrow.toDateString()) {
        task.displayCategory = "Tomorrow";
        tomorrowsTasks.push(task);
      } else if (taskDate.getTime() > tomorrow.getTime()) {
        task.displayCategory = "Future";
        futureTasks.push(task);
      } else if (taskDate.getTime() < today.getTime()) {
        task.displayCategory = "Overdue";
        overdueTasks.push(task);
      } else {
        // TODO - what here?
      }
    }

    if (tasksWithNoDate.length > 0) {
      tasksWithNoDate.unshift({
        isHeader: true,
        name: "No Date"
      });
    }

    if (todaysTasks.length > 0) {
      todaysTasks.unshift({
        isHeader: true,
        name: "Today"
      });
    }

    if (tomorrowsTasks.length > 0) {
      tomorrowsTasks.unshift({
        isHeader: true,
        name: "Tomorrow"
      });
    }

    if (futureTasks.length > 0) {
      futureTasks.unshift({
        isHeader: true,
        name: "Future"
      });
    }

    if (overdueTasks.length > 0) {
      overdueTasks.unshift({
        isHeader: true,
        name: "Overdue"
      });
    }

    return tasksWithNoDate.concat(
      todaysTasks,
      tomorrowsTasks,
      futureTasks,
      overdueTasks
    );
  };

  _fetchData = async () => {
    // TODO - set state.isRefreshing

    this.props.syncTasks();
    /*
      Manually refreshing the list via swipe down is currently
      not supported.

      TODO - implement it
    */
    return;
  };

  _isHeaderCurrentlyCollapsed = category => {
    if (category === "No Date") {
      return this._viewIsCollapsed(TaskViewActions.TASKS_WITH_NO_DATE);
    } else if (category === "Today") {
      return this._viewIsCollapsed(TaskViewActions.TODAYS_TASKS);
    } else if (category === "Tomorrow") {
      return this._viewIsCollapsed(TaskViewActions.TOMORROWS_TASKS);
    } else if (category === "Future") {
      return this._viewIsCollapsed(TaskViewActions.FUTURE_TASKS);
    } else if (category === "Overdue") {
      return this._viewIsCollapsed(TaskViewActions.OVERDUE_TASKS);
    } else {
      return false; // TODO - what here?
    }
  };

  _renderRow = row => {
    try {
      return row.isHeader ? this._renderHeader(row) : this._renderTask(row);
    } catch (err) {
      console.log("err rendering row: " + err);
    }
  };

  _renderTask = task => {
    // only render if header is not collapsed
    if (!this._isHeaderCurrentlyCollapsed(task.displayCategory)) {
      return (
        <TaskRow
          title={task.name}
          isComplete={task.isCompleted || false}
          taskId={task.id}
          onCheckBoxClicked={async isCompleted => {
            let completionDateTimeUtc = new Date().getTime();

            task.isCompleted = isCompleted;
            task.completionDateTimeUtc = completionDateTimeUtc;
            task.updatedAtDateTimeUtc = completionDateTimeUtc;

            if (!task.isCompleted && task.completionDateTimeUtc) {
              // if the task is "unchecked", delete the completion time
              task.completionDateTimeUtc = undefined;
            }

            /*
              Update task locally, before checking network access. This is
              because we will perform a local update regardless, and doing
              so immediately is a much better user experience.
            */
            this._updateTaskLocally(task);

            if (UserController.canAccessNetwork(this.props.profile)) {
              let userId = this.props.profile.id;
              let password = this.props.profile.password;

              TaskController.updateTask(task, userId, password).catch(error => {
                if (error.name === "RetryableError") {
                  this._queueTaskUpdate(task);
                } else {
                  // TODO
                }
              });
            } else {
              this._queueTaskUpdate(task);
            }
          }}
          onPress={() => {
            this.props.navigator.push({
              title: "Task View",
              component: SingleTaskPage,
              index: 2,
              transition: "FloatFromBottom",
              passProps: {
                taskId: task.id
              }
            });
          }}
        />
      );
    }

    return <View />;
  };

  // TODO - clean up this sloppy logic / indirection; should not need a function
  _viewIsCollapsed(view) {
    return this.props.taskCategories[view].isCollapsed;
  }

  _updateTaskLocally = task => {
    this.props.createOrUpdateTask(task);
  };

  _queueTaskUpdate = task => {
    // task is queued only when network could not be reached
    this.props.addPendingTaskUpdate(task);
  };

  _renderHeader = header => {
    let headerCollapseStatusImage = this._isHeaderCurrentlyCollapsed(
      header.name
    )
      ? require("../../images/arrow_right_black.png")
      : require("../../images/arrow_down_black.png");

    return (
      <TouchableOpacity
        key={"menu-item-lists"}
        style={styles.headerRow}
        onPress={() => {
          if (header.name === "No Date") {
            this.props.toggleTaskView(TaskViewActions.TASKS_WITH_NO_DATE);
          } else if (header.name === "Today") {
            this.props.toggleTaskView(TaskViewActions.TODAYS_TASKS);
          } else if (header.name === "Tomorrow") {
            this.props.toggleTaskView(TaskViewActions.TOMORROWS_TASKS);
          } else if (header.name === "Future") {
            this.props.toggleTaskView(TaskViewActions.FUTURE_TASKS);
          } else if (header.name === "Overdue") {
            this.props.toggleTaskView(TaskViewActions.OVERDUE_TASKS);
          }

          let profile = this.props.profile;
          let showCompletedTasks = profile && profile.showCompletedTasks;

          // TODO - should we delay here?
          this._refreshEntireList(this.props.tasks, showCompletedTasks);
        }}
      >
        <View style={[AppStyles.row]}>
          <View style={styles.headerText}>
            <Image
              key={`${header.name}-collapse-image`}
              style={styles.icon}
              source={headerCollapseStatusImage}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[AppStyles.baseText]}>
              {header.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _constructNavbar = () => {
    let title = "Tasks";

    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.toggleSideMenu();
        }}
        icon={"bars"}
      />
    );

    let mediumRightNavButton = (
      <NavbarButton
        navButtonLocation={AppConstants.MEDIUM_RIGHT_NAV_LOCATION}
        onPress={() => {
          this.props.navigator.push({
            title: "Create Task",
            component: CreateTask,
            index: 2,
            transition: "FloatFromBottom"
          });
        }}
        icon={"plus"}
      />
    );

    let farRightNavButton = (
      <NavbarButton
        navButtonLocation={AppConstants.FAR_RIGHT_NAV_LOCATION}
        onPress={() => {
          this.props.navigator.push({
            title: "Settings",
            component: Settings,
            index: 2,
            transition: "FloatFromBottom"
          });
        }}
        icon={"cog"}
      />
    );

    let rightNavButtons = (
      <View style={AppStyles.rightNavButtons}>
        {mediumRightNavButton}
        {farRightNavButton}
      </View>
    );

    return (
      <View style={[AppStyles.navbarContainer]}>
        <NavigationBar
          title={<NavbarTitle title={title || null} />}
          statusBar={{ style: "light-content", hidden: false }}
          style={[AppStyles.navbar]}
          tintColor={AppConfig.primaryColor}
          leftButton={leftNavBarButton}
          rightButton={rightNavButtons}
        />
      </View>
    );
  };

  _renderTasks = () => {
    // if no tasks exist display text so that the screen is not blank
    if (this.state.dataSource.getRowCount() === 0) {
      // TODO - consider adding a more accessible way to create a task
      // for this scenario, like a link, etc

      return (
        <TouchableOpacity
          onPress={() => {
            this.props.navigator.push({
              title: "Create Task",
              component: CreateTask,
              index: 2,
              transition: "FloatFromBottom"
            });
          }}
          activeOpacity={0.7}
        >
          <View style={[AppStyles.paddingMinimal]}>
            <Text
              style={[
                AppStyles.baseTextLight,
                AppStyles.linkText,
                AppStyles.centered
              ]}
            >
              {"Create Task"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <ListView
        initialListSize={this.state.dataSource.getRowCount()}
        automaticallyAdjustContentInsets={false}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        renderFooter={() => {
          <View />;
        }}
        // TODO - use real section headers
        renderSectionHeader={() => {
          return <View />;
        }}
        contentContainerStyle={AppStyles.paddingBottom}
        enableEmptySections={true}
        refreshControl={
          <RefreshControl
            enabled={false}
            refreshing={this.state.isRefreshing}
            onRefresh={this._fetchData}
            tintColor={AppConfig.primaryColor}
          />
        }
      />
    );
  };

  render = () => {
    return (
      <View style={[AppStyles.container]}>
        {this._constructNavbar()}
        {this._renderTasks()}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  createTaskRowText: {
    textAlign: "center",
    fontWeight: "500",
    backgroundColor: "transparent"
  },
  icon: {
    width: 32,
    height: 32,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    justifyContent: "center",
    alignItems: "center"
  },
  headerRow: {
    flexDirection: "row",
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10
  }
});

const mapStateToProps = (state, ownProps) => {
  return {
    isLoggedIn: state.entities.user.isLoggedIn,
    profile: state.entities.user.profile,
    tasks: state.entities.task.tasks,
    taskCategories: state.ui.taskview,
    shouldRefreshTaskView: state.ui.taskview.shouldRefreshTaskView
  };
};

const mapDispatchToProps = {
  syncTasks: TaskActions.syncTasks,
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  addPendingTaskUpdate: TaskActions.addPendingTaskUpdate,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  updateHighlight: SideMenuActions.updateHighlight,
  toggleTaskView: TaskViewActions.toggleCategory,
  refreshTaskView: TaskViewActions.refreshTaskView
};

export default connect(mapStateToProps, mapDispatchToProps)(MultiTaskPage);
