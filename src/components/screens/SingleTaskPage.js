/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  Alert,
  Button,
  DatePickerAndroid,
  DatePickerIOS,
  Keyboard,
  Picker,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { connect } from "react-redux";

import * as TaskViewActions from "../../actions/ui/taskview";

import * as UserController from "../../models/controllers/user";
import * as TaskController from "../../models/controllers/task";
import * as TaskStorage from "../../models/storage/task-storage";
import * as TaskQueue from "../../models/storage/task-queue";
import * as TaskActions from "../../actions/entities/task";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import dateFormat from "dateformat";
import Validator from "validator";

import DateUtils from "../../utils/date-utils";
import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

import MultiTaskPage from "./MultiTaskPage";

class SingleTaskPage extends Component {
  static componentName = "SingleTaskPage";

  static propTypes = {
    taskId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      updateError: "",
      updateSuccess: "",
      isUpdating: false,

      task: props.tasks[this.props.taskId],

      nameValidationError: "",
      notesValidationError: "",
      displayingDateDialog: false
    };
  }

  componentWillReceiveProps = nextProps => {
    // Update the task, in case the sync has pulled in a more recent version.
    this.setState({
      task: this._getTask(this.state.task, nextProps)
    });
  };

  /*
    SingleTaskPage keeps a local reference to a task, so that the user can
    edit it (as well as discard edits) without polluting global state. Global
    state is only modified when the user confirms their changes.

    This function fetches the task from global state, so that a local reference
    can be made.

    However, when the task is synced while the user is editing it, we might
    need to update our local, now out-of-date, reference. We have made the
    conscious decision to ONLY, ONLY update the task's ID for two reasons.

    1. We do not want the EditTask page to unexpectedly change or discard
       the user's edits without their consent.
    2. An edge case exists such that, if the local reference to ID is not
       updated, the task cannot possibly be updated.

       See the following scenario:

          - The task is created ONLY on the client and gets assigned a
            temporary ID. This is possible when no network connectivity exists.
          - The task is queued to be submitted to the server.
          - The user navigates to the SingleTaskPage, while the task is still
            queued, which causes the local reference to have the temporary ID.
          - The task is finally submitted to the server and gets its temporary,
            client-assigned ID replaced by a permanent, server-assigned ID. In
            this scenario we absolutely MUST update our local reference with the
            server-assigned ID. Otherwise, the server will not recognize the
            old, client-assigned ID.

    NOTE: This function can likely be refined.
  */
  _getTask = (currentTask, props) => {
    let id = this.props.taskId;

    let updatedTask = props.tasks[id];

    if (!updatedTask) {
      for (let taskId in props.tasks) {
        if (props.tasks[taskId].clientAssignedTaskId === id) {
          updatedTask = props.tasks[taskId];
        }
      }
    }

    // We only want to update taskId. If we cannot do so (i.e., updatedTask is
    // undefined), or if the taskId does not require updated, then we simply
    // return the current task.
    if (!updatedTask || currentTask.id === updatedTask.id) {
      return currentTask;
    } else {
      return Object.assign(currentTask, { id: updatedTask.id });
    }
  };

  _onDelete = () => {
    Alert.alert("", "Are you sure you want to delete this task?", [
      {
        text: "Close",
        onPress: () => {
          /* do nothing */
        }
      },
      {
        text: "Yes",
        onPress: async () => {
          let task = this.state.task;
          task.isDeleted = true;

          if (
            task.id in this.props.pendingTaskCreates ||
            task.id in this.props.pendingTaskUpdates
          ) {
            /*
              If the task is in the pendingQueue, we update the queue rather
              than attempt to submit the update to the server. A separate
              process will handle submitting the queued tasks.
            */
            this._deleteTaskLocallyAndRedirect(task, true);
          } else if (UserController.canAccessNetwork(this.props.profile)) {
            TaskController.deleteTask(
              task.id,
              this.props.profile.id,
              this.props.profile.password
            )
              .then(response => {
                // use the task in the reponse; it is the most up-to-date
                this._deleteTaskLocallyAndRedirect(response.task);
              })
              .catch(error => {
                if (error.name === "NoConnection") {
                  this._deleteTaskLocallyAndRedirect(task, true);
                } else {
                  // TODO
                }
              });
          } else {
            this._deleteTaskLocallyAndRedirect(task, true);
          }
        }
      }
    ]);
  };

  _deleteTaskLocallyAndRedirect = (task, queueTaskDeletion) => {
    if (queueTaskDeletion) {
      // mark update time, before queueing
      task.updatedAtDateTimeUtc = new Date();

      // task is queued only when network could not be reached
      this.props.addPendingTaskDelete(task);
    }

    /*
     The task has been marked `isDeleted = true`.

     We choose to "createOrUpdateTask" the task, even though it is being
     deleted, so that we can correctly manage the sync. Without a reference to
     this task, a sync might receive an outdated (undeleted) version of the
     task and incorrectly re-recreate it.
    */
    TaskStorage.createOrUpdateTask(task);
    TaskQueue.queueTaskDelete(task);
    this.props.createOrUpdateTask(task);

    this.props.refreshTaskViewCollapseStatus();

    this.props.navigator.replace({
      title: "Main",
      component: MultiTaskPage,
      index: 0
    });
  };

  _onSubmitEdit = async () => {
    let profile = this.props.profile;

    let updatedTaskName = this.state.task.name || "";
    let updatedTaskNotes = this.state.task.notes || "";

    let nameValidationError = "";
    let notesValidationError = "";

    if (!Validator.isLength(updatedTaskName, { min: 1, max: 250 })) {
      nameValidationError = "Name must be between 1 and 250 characters";
    }

    if (!Validator.isLength(updatedTaskNotes, { min: 0, max: 5000 })) {
      notesValidationError = "Notes must be between 0 and 5000 characters";
    }

    if (nameValidationError || notesValidationError) {
      this.setState({
        updateError: "",
        updateSuccess: "",
        nameValidationError: nameValidationError,
        notesValidationError: notesValidationError
      });

      return; // validation failed; cannot update task
    }

    this.setState({
      isUpdating: true,
      updateSuccess: "",
      updateError: "",
      notesValidationError: "",
      nameValidationError: ""
    });

    let taskId = this.state.task.id;

    if (
      taskId in this.props.pendingTaskCreates ||
      taskId in this.props.pendingTaskUpdates
    ) {
      /*
        If the task is in the pendingQueue, we update the queue rather than
        attempt to submit the update to the server. A separate process will
        handle submitting the queued tasks.
      */
      this._updateTaskLocally(this.state.task, true);
    } else if (UserController.canAccessNetwork(profile)) {
      TaskController.updateTask(this.state.task, profile.id, profile.password)
        .then(response => {
          // use the task in the reponse; it is the most up-to-date
          this._updateTaskLocally(response.task);
        })
        .catch(error => {
          if (error.name === "NoConnection") {
            this._updateTaskLocally(this.state.task, true);
          } else {
            this.setState({
              isUpdating: false,
              updateError: error.message,
              updateSuccess: ""
            });
          }
        });
    } else {
      this._updateTaskLocally(this.state.task, true);
    }
  };

  _updateTaskLocally = (task, queueTaskUpdate) => {
    if (queueTaskUpdate) {
      // mark update time, before queueing
      task.updatedAtDateTimeUtc = new Date();

      // task is queued only when network could not be reached
      this.props.addPendingTaskUpdate(task);
    }

    TaskStorage.createOrUpdateTask(task);
    TaskQueue.queueTaskUpdate(task);
    this.props.createOrUpdateTask(task);

    this.props.refreshTaskViewCollapseStatus();

    this.setState({
      updateSuccess: "Update successful!",
      isUpdated: false
    });

    setTimeout(() => {
      this.setState({ updateSuccess: "" });
    }, 2000); // remove message after 2 seconds
  };

  _renderDatePicker = () => {
    if (Platform.OS === "ios") {
      this._renderIOSDatePicker();
    } else {
      this._renderAndroidDatePicker();
    }

    Keyboard.dismiss();
  };

  _renderIOSDatePicker = () => {
    // TODO
  };

  _renderAndroidDatePicker = async () => {
    try {
      var options = this.state.task.dueDateTimeUtc
        ? { date: new Date(this.state.task.dueDateTimeUtc) }
        : {};

      let updatedTask = this.state.task;

      const { action, year, month, day } = await DatePickerAndroid.open(
        options
      );

      if (action !== DatePickerAndroid.dismissedAction) {
        updatedTask.dueDateTimeUtc = new Date(year, month, day);
        updatedTask.dueDateTimeUtc = DateUtils.oneSecondBeforeMidnight(
          updatedTask.dueDateTimeUtc
        );
      }

      this.setState({
        task: updatedTask,
        displayingDateDialog: false
      });
    } catch ({ code, message }) {
      console.warn(`Error in example '${stateKey}': `, message);
    }
  };

  _constructNavbar = () => {
    let title = "Edit Task";
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.navigator.pop();
        }}
        icon={"arrow-left"}
      />
    );

    let mediumRightNavButton = (
      <NavbarButton
        navButtonLocation={AppConstants.MEDIUM_RIGHT_NAV_LOCATION}
        onPress={() => {
          this._onSubmitEdit();
        }}
        icon={"floppy-o"}
      />
    );

    let farRightNavButton = (
      <NavbarButton
        navButtonLocation={AppConstants.FAR_RIGHT_NAV_LOCATION}
        onPress={() => {
          this._onDelete();
        }}
        icon={"trash-o"}
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

  render = () => {
    // TODO - move this to more suitable area
    if (this.state.displayingDateDialog) {
      this._renderDatePicker();
    }

    // TODO - refine this approach

    let dateString;
    let dateStringStyle = [AppStyles.baseTextLight];
    if (this.state.task.dueDateTimeUtc) {
      // TODO - refine how we format date (and move to utils)

      dateString = dateFormat(this.state.task.dueDateTimeUtc, "mmmm d yyyy");
    } else {
      dateString = "Select a due date";
      dateStringStyle.push(AppStyles.linkText);
    }

    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}
      >
        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>
          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Name</Text>
            <TextInput
              style={[AppStyles.baseTextLight]}
              onChangeText={updatedName => {
                let task = this.state.task;
                task.name = updatedName;
                this.setState({ task: task });
              }}
              value={this.state.task.name}
            />
            <Text style={[AppStyles.errorText]}>
              {this.state.nameValidationError}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Notes</Text>
            <TextInput
              multiline={true}
              style={[AppStyles.baseTextLight]}
              onChangeText={updatedNotes => {
                let task = this.state.task;
                task.notes = updatedNotes;
                this.setState({ task: task });
              }}
              value={this.state.task.notes}
            />

            <Text style={[AppStyles.errorText]}>
              {this.state.notesValidationError}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Due Date</Text>
            <TextInput
              style={[AppStyles.baseTextLight, dateStringStyle]}
              onFocus={() => {
                this.setState({
                  displayingDateDialog: true
                });
              }}
              value={dateString}
            />
          </View>

          <Text style={[AppStyles.successText]}>
            {this.state.updateSuccess}
          </Text>

          <Text style={[AppStyles.errorText]}>
            {this.state.updateError}
          </Text>
        </View>
      </ScrollView>
    );
  };
}

const mapStateToProps = state => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  tasks: state.entities.task.tasks,
  pendingTaskCreates: state.entities.task.pendingTaskActions.create || {},
  pendingTaskUpdates: state.entities.task.pendingTaskActions.update || {}
});

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  deleteTask: TaskActions.deleteTask,
  addPendingTaskUpdate: TaskActions.addPendingTaskUpdate,
  addPendingTaskDelete: TaskActions.addPendingTaskDelete,
  refreshTaskViewCollapseStatus: TaskViewActions.refreshTaskViewCollapseStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleTaskPage);
