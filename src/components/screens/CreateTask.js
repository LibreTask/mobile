/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  Button,
  DatePickerAndroid,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { connect } from "react-redux";

import dateFormat from "dateformat";
import Validator from "validator";

import * as TaskViewActions from "../../actions/ui/taskview";

import * as TaskActions from "../../actions/entities/task";
import * as TaskController from "../../models/controllers/task";
import * as TaskStorage from "../../models/storage/task-storage";
import * as TaskQueue from "../../models/storage/task-queue";
import * as UserController from "../../models/controllers/user";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import DateUtils from "../../utils/date-utils";
import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

import Icon from "react-native-vector-icons/FontAwesome";

class CreateTask extends Component {
  static componentName = "CreateTask";

  constructor(props) {
    super(props);

    this.state = {
      creationError: "",
      isCreatingTask: false,
      taskName: "",
      taskNotes: "",
      taskDueDateTimeUtc: "",
      nameValidationError: "",
      notesValidationError: "",
      notesIconSelected: false,
      calendarIconSelected: false,
      displayingDateDialog: false
    };
  }

  _createTask = async () => {
    if (this.state.isCreatingTask) {
      // TODO - warn
      return;
    }

    let taskName = this.state.taskName || "";

    // only include optional attributes if their icon is selected
    let taskNotes = this.state.notesIconSelected ? this.state.taskNotes : "";
    let taskDueDateTimeUtc = this.state.calendarIconSelected
      ? this.state.taskDueDateTimeUtc
      : undefined;

    let nameValidationError = "";
    let notesValidationError = "";

    if (!Validator.isLength(taskName, { min: 2, max: 100 })) {
      nameValidationError = "Name must be between 2 and 100 characters";
    }

    if (
      this.state.notesIconSelected &&
      !Validator.isLength(taskNotes, { min: 0, max: 5000 })
    ) {
      notesValidationError = "Notes must be between 0 and 5000 characters";
    }

    if (nameValidationError) {
      this.setState({
        creationError: "",
        nameValidationError: nameValidationError,
        notesValidationError: notesValidationError
      });

      return; // validation failed; cannot create task
    }

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState(
        {
          isCreatingTask: true,
          creationError: "",
          nameValidationError: "",
          notesValidationError: ""
        },
        () => {
          let userId = this.props.profile.id;
          let password = this.props.profile.password;
          let isCompleted = false;
          let completionDateTimeUtc = undefined;

          TaskController.createTask(
            taskName,
            taskNotes,
            taskDueDateTimeUtc,
            isCompleted,
            completionDateTimeUtc,
            userId,
            password
          )
            .then(response => {
              let task = response.task;
              task.isCompleted = false; // initialize to false

              TaskStorage.createOrUpdateTask(task);
              this.props.createOrUpdateTask(task);

              this.props.navigator.pop();
            })
            .catch(error => {
              if (error.name === "NoConnection") {
                this._createTaskLocallyAndRedirect(
                  taskName,
                  taskNotes,
                  taskDueDateTimeUtc
                );
              } else {
                this.setState({
                  creationError: error.message,
                  isCreatingTask: false
                });
              }
            });
        }
      );
    } else {
      this._createTaskLocallyAndRedirect(
        taskName,
        taskNotes,
        taskDueDateTimeUtc
      );
    }
  };

  _createTaskLocallyAndRedirect = (name, notes, dueDateTimeUtc) => {
    // create task locally; user it not logged in or has no network connection
    let task = TaskController.constructTaskLocally(name, notes, dueDateTimeUtc);
    TaskStorage.createOrUpdateTask(task);
    TaskQueue.queueTaskCreate(task);
    this.props.createOrUpdateTask(task);
    this.props.addPendingTaskCreate(task);

    this.props.refreshTaskViewCollapseStatus();

    // navigate to main on success
    this.props.navigator.pop();
  };

  _constructNotesTextEdit = () => {
    if (!this.state.notesIconSelected) {
      return <View />;
    }

    return (
      <View style={[AppStyles.paddingVertical]}>
        <Text style={[AppStyles.baseText]}>Notes</Text>
        <TextInput
          style={[AppStyles.baseText]}
          onChangeText={updatedNotes => {
            this.setState({ taskNotes: updatedNotes });
          }}
          value={this.state.taskNotes}
        />

        <Text style={[AppStyles.errorText]}>
          {this.state.notesValidationError}
        </Text>
      </View>
    );
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
      var options = this.state.taskDueDateTimeUtc
        ? { date: this.state.taskDueDateTimeUtc }
        : {};

      var newState = {
        displayingDateDialog: false // stop displaying in all scenarios
      };
      const { action, year, month, day } = await DatePickerAndroid.open(
        options
      );
      if (action !== DatePickerAndroid.dismissedAction) {
        var date = new Date(year, month, day);
        date = DateUtils.oneSecondBeforeMidnight(date);
        newState["taskDueDateTimeUtc"] = date;
      }
      this.setState(newState);
    } catch ({ code, message }) {
      console.warn(`Error in example '${stateKey}': `, message);
    }
  };

  _constructDatePicker = () => {
    if (!this.state.calendarIconSelected) {
      return <View />;
    }

    let dateString = this.state.taskDueDateTimeUtc
      ? dateFormat(this.state.taskDueDateTimeUtc, "mmmm d yyyy")
      : "";

    return (
      <View style={[AppStyles.paddingVertical]}>
        <Text style={[AppStyles.baseText]}>Due Date</Text>
        <TextInput
          style={[AppStyles.baseText]}
          onFocus={() => {
            this.setState({
              displayingDateDialog: true
            });
          }}
          value={dateString}
        />
      </View>
    );
  };

  _constructNavbar = () => {
    let title = "Create Task";
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.navigator.pop();
        }}
        icon={"arrow-left"}
      />
    );

    return (
      <View style={[AppStyles.navbarContainer]}>
        <NavigationBar
          title={<NavbarTitle title={title || null} />}
          statusBar={{ style: "light-content", hidden: false }}
          style={[AppStyles.navbar]}
          tintColor={AppConfig.primaryColor}
          leftButton={leftNavBarButton}
        />
      </View>
    );
  };

  _constructAttributeIcons = () => {
    return (
      <View style={[AppStyles.row]}>
        <TouchableOpacity
          onPress={() => {
            this.setState({
              notesIconSelected: !this.state.notesIconSelected
            });
          }}
          style={styles.mediumIcon}
          activeOpacity={0.7}
        >
          <Icon
            name={"comment-o"}
            size={40}
            color={this.state.notesIconSelected ? "green" : "black"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            this.setState({
              calendarIconSelected: !this.state.calendarIconSelected
            });
          }}
          style={styles.mediumIcon}
          activeOpacity={0.7}
        >
          <Icon
            name={"calendar"}
            size={40}
            color={this.state.calendarIconSelected ? "green" : "black"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  render = () => {
    // TODO - move this to more suitable area
    if (this.state.displayingDateDialog) {
      this._renderDatePicker();
    }

    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        ref={"scrollView"}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}
      >

        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Name</Text>
            <TextInput
              style={[AppStyles.baseText]}
              onChangeText={updatedName => {
                this.setState({ taskName: updatedName });
              }}
              value={this.state.taskName}
            />

            <Text style={[AppStyles.errorText]}>
              {this.state.nameValidationError}
            </Text>
          </View>

          {this._constructNotesTextEdit()}
          {this._constructDatePicker()}

          <Text style={[AppStyles.baseTextSmall, AppStyles.errorText]}>
            {this.state.creationError}
          </Text>

          <View style={[AppStyles.row]}>

            <View style={[AppStyles.button]}>
              <Button title={"Create Task"} onPress={this._createTask} />
            </View>
          </View>

          {this._constructAttributeIcons()}
        </View>

      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  mediumIcon: {
    padding: 10
  },
  selectedIcon: {
    color: "green"
  }
});

const mapStateToProps = state => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile
});

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  addPendingTaskCreate: TaskActions.addPendingTaskCreate,
  refreshTaskViewCollapseStatus: TaskViewActions.refreshTaskViewCollapseStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateTask);
