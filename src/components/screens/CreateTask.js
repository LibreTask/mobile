/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  ActivityIndicator,
  Button,
  DatePickerAndroid,
  DatePickerIOS,
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
      displayingDateDialog: false,
      notesHeight: 0,
      nameHeight: 0,
      mostRecentIOSDate: undefined // TODO - refine this approach
    };
  }

  _createTask = async () => {
    if (this.state.isCreatingTask) {
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

    if (!Validator.isLength(taskName, { min: 1, max: 250 })) {
      nameValidationError = "Name must be between 1 and 250 characters";
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

              this.props.createOrUpdateTask(task);

              this.props.navigator.pop();
            })
            .catch(error => {
              if (error.name === "RetryableError") {
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
          multiline={true}
          style={[
            AppStyles.baseTextLight,
            { height: Math.max(35, this.state.notesHeight) }
          ]}
          onContentSizeChange={event => {
            this.setState({
              notesHeight: event.nativeEvent.contentSize.height
            });
          }}
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
    let datePicker;
    if (Platform.OS === "ios") {
      datePicker = this._renderIOSDatePicker();
    } else {
      datePicker = this._renderAndroidDatePicker();
    }

    Keyboard.dismiss();
    return datePicker;
  };

  _renderIOSDatePicker = () => {
    var date = this.state.taskDueDateTimeUtc
      ? new Date(this.state.taskDueDateTimeUtc)
      : new Date();

    return (
      <View>
        <Text style={[AppStyles.baseText]}>Due Date</Text>
        <View>
          <DatePickerIOS
            date={date}
            mode="date"
            onDateChange={date => {
              this.setState({
                mostRecentIOSDate: date
              });
            }}
          />
        </View>
        <View style={styles.iosDateSelectorRow}>
          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              this.setState({
                displayingDateDialog: false
              });
            }}
          >
            <Text style={[AppStyles.baseLinkTextLarge]}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              this._onDateUpdate(this.state.mostRecentIOSDate || new Date());
              this.setState({
                displayingDateDialog: false
              });
            }}
          >
            <Text style={[AppStyles.baseLinkTextLarge, styles.iosDateSave]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderAndroidDatePicker = async () => {
    try {
      var options = this.state.taskDueDateTimeUtc
        ? { date: new Date(this.state.taskDueDateTimeUtc) }
        : {};

    DatePickerAndroid.open(
        options
      ).then(ret => {

        if (ret.action !== DatePickerAndroid.dismissedAction) {
          this._onDateUpdate(new Date(ret.year, ret.month, ret.day));
        }

        this.setState({
          displayingDateDialog: false
        });
      });

      return (<View />); // android datepicker doesn't return a JSX object
    } catch (err) {
      /* TODO */
    }
  };

  _onDateUpdate = updatedDate => {
    this.setState({
      taskDueDateTimeUtc: DateUtils.oneSecondBeforeMidnight(
        updatedDate
      ).getTime()
    });
  };

  _dateSelectionView = () => {
    if (this.state.displayingDateDialog) {
      return this._renderDatePicker();
    } else if (this.state.calendarIconSelected) {
      let dateString;
      let dateStringStyle = [AppStyles.baseTextLight];
      let clearDateButton;
      if (this.state.taskDueDateTimeUtc) {
        // TODO - refine how we format date (and move to utils)

        dateString = dateFormat(
          this.state.taskDueDateTimeUtc,
          "ddd, mmm dS, yyyy"
        );
        clearDateButton = (
          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              this.setState({
                taskDueDateTimeUtc: undefined
              });
            }}
          >
            <Text style={[AppStyles.baseLinkText]}>Clear date</Text>
          </TouchableOpacity>
        );
      } else {
        dateString = "Select a due date";
        dateStringStyle.push(AppStyles.linkText);
      }

      return (
        <View>
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
          {clearDateButton}
        </View>
      );
    } else {
      return (<View />);
    }
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

        {/*
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
        */}
      </View>
    );
  };

  _activityIndactor = () => {
    return (
      <ActivityIndicator
        style={[AppStyles.progressSpinner]}
        color="blue"
        size="large"
      />
    );
  };

  _viewContent = windowOpacity => {
    return (
      <View style={[AppStyles.padding, { opacity: windowOpacity }]}>
        <View style={[AppStyles.paddingVertical]}>
          <Text style={[AppStyles.baseText]}>Name</Text>
          <TextInput
            style={[
              AppStyles.baseTextLight,
              { height: Math.max(35, this.state.nameHeight) }
            ]}
            onContentSizeChange={event => {
              this.setState({
                nameHeight: event.nativeEvent.contentSize.height
              });
            }}
            style={[AppStyles.baseTextLight]}
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
        {/*this._dateSelectionView()*/}

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
    );
  };

  render = () => {
    // TODO - move this to more suitable area
    if (this.state.displayingDateDialog) {
      this._renderDatePicker();
    }

    let content;
    if (this.state.isCreatingTask) {
      let windowOpacity = AppConfig.loadingOpacity;
      content = (
        <View>
          {this._activityIndactor()}
          {this._viewContent(windowOpacity)}
        </View>
      );
    } else {
      let windowOpacity = 1;
      content = (
        <View>
          {this._viewContent(windowOpacity)}
        </View>
      );
    }

    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        ref={"scrollView"}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}
      >
        {this._constructNavbar()}
        {content}
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
  },
  iosDateSelectorRow: {
    flexDirection: "row",
    flex: 1
  },
  iosDateSave: {
    marginHorizontal: 40
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
