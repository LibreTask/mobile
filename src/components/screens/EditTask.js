/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Button,
  DatePickerAndroid,
  DatePickerIOS,
  Picker,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'

import * as UserController from '../../models/controllers/user'
import * as ListController from '../../models/controllers/list'
import * as TaskController from '../../models/controllers/task'
import * as TaskStorage from '../../models/storage/task-storage'
import * as TaskActions from '../../actions/entities/task'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import Validator from 'validator'

import AppConfig from '../../config'
import AppStyles from '../../styles'
import AppConstants from '../../constants'

import MultiTaskPage from './MultiTaskPage'

class EditTask extends Component {
  static componentName = 'EditTask'

  static propTypes = {
    taskId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      updateError: '',
      updateSuccess: '',
      isUpdating: false,

      task: this._getTask(),
      list: this._getList(),

      nameValidationError: '',
      notesValidationError: ''
    }
  }

  _getTask = () => {
    return this.props.tasks[this.props.taskId]
  }

  _getList = () => {
    let task = this._getTask()
    return this.props.lists[task.listId]
  }

  _onDelete = () => {
    Alert.alert(
      '',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Close',
          onPress: () => { /* do nothing */ }
        },
        {
          text: 'Yes',
          onPress: async () => {

            if (UserController.canAccessNetwork(this.props.profile)) {
              TaskController.deleteTask(
                this.props.task.id,
                this.props.profile.id,
                this.props.profile.password
              )
              .then(response => {
                this._deleteTaskLocallyAndRedirect(this.props.task.id)
              })
              .catch(error => {
                if (error.name === 'NoConnection') {
                  this._deleteTaskLocallyAndRedirect(this.props.task.id)
                } else {
                  // TODO
                }
              })
            } else {
              this._deleteTaskLocallyAndRedirect(this.props.task.id)
            }
          }
        },
      ],
    )
  }

  _deleteTaskLocallyAndRedirect = (taskId) => {
    TaskStorage.deleteTaskByTaskId(taskId)
    this.props.deleteTask(taskId)

    this.props.navigator.replace({
      title: 'Main',
      component: MultiTaskPage,
      index: 0,
    })
  }

  _onSubmitEdit = async () => {
    let profile = this.props.profile;

    let updatedTaskName = this.state.task.name || ''
    let updatedTaskNotes = this.state.task.notes || ''

    let nameValidationError = ''
    let notesValidationError = ''

    if (!Validator.isLength(updatedTaskName, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (!Validator.isLength(updatedTaskNotes, {min: 0, max: 5000})) {
      notesValidationError = 'Notes must be between 0 and 5000 characters'
    }

    if (nameValidationError || notesValidationError) {
      this.setState({
        nameValidationError: nameValidationError,
        notesValidationError: notesValidationError
      })

      return; // validation failed; cannot update task
    }

    this.setState({
      isUpdating: true,
      updateSuccess: '',
      updateError: '',
      notesValidationError: '',
      nameValidationError: ''
    })

    if (UserController.canAccessNetwork(this.props.profile)) {
      TaskController.updateTask(this.state.task, profile.id, profile.password)
      .then(response => {

        this._updateTaskLocally(response.task)
      })
      .catch(error => {

        if (error.name === 'NoConnection') {
          this._updateTaskLocally(this.state.task)
        } else {
          this.setState({
            isUpdating: false,
            updateError: error.message,
            updateSuccess: ''
          })
        }
      })
    } else {
      this._updateTaskLocally(this.state.task)
    }
  }

  _updateTaskLocally = (task) => {
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)

    this.setState({
      updateSuccess: 'Update successful!',
      isUpdated: false
    })

    setTimeout(() => {
      this.setState({ updateSuccess: '' })
    }, 1500) // remove message after 1.5 seconds
  }

  _showDatePicker = async () => {

    let chosenDate = this.state.task.dueDateTimeUtc;
    let minDate = new Date()
    let maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10) // aribtrarily add 10 years

    if (!chosenDate) {
      chosenDate = new Date() // aribtrarily choose today
    }

    if (Platform.OS === 'ios') {
      // TODO -
    } else {

      let options = {
        date: chosenDate,
        minDate: minDate,
        maxDate: maxDate
      }

      try {
        const {year, month, day} = await DatePickerAndroid.open(options)
        this.setState({
          dueDateTimeUtc: new Date(year, month, day)
        })
      } catch (error) {
        console.log("error: " + error)
        // TODO -
      }
    }
  }

  _currentDateToText = () => {

    // TODO - refine this approach

    let dateString;
    let dateStringStyle = [AppStyles.baseText]
    if (this.state.task.dueDateTimeUtc) {

      // TODO - refine how we format date (and move to utils)

      dateString = this.state.task.dueDateTimeUtc;
    } else {
      dateString = 'Select a due date'
      dateStringStyle.push(AppStyles.linkText)
    }

    return (
      <Text style={dateStringStyle}>
        {dateString}
      </Text>
    )
  }

  _getListNames = () => {
    let listNames = []

    for (let listId in this.props.lists) {
      let list = this.props.lists[listId]
      listNames.push(
        <Picker.Item
          label={list.name}
          value={list.id}
          key={list.id}
        />
      )
    }

    return listNames
  }

  _constructNavbar = () => {

    let title = 'Task View' // TODO
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={()=>{
          this.props.navigator.pop()
        }}
        icon={'arrow-left'} />
    )

    let mediumRightNavButton = (
      <NavbarButton
        navButtonLocation={AppConstants.MEDIUM_RIGHT_NAV_LOCATION}
        onPress={() => {
          this._onSubmitEdit()
        }}
        icon={'floppy-o'} />
    )

    let farRightNavButton = (
      <NavbarButton
        navButtonLocation={AppConstants.FAR_RIGHT_NAV_LOCATION}
        onPress={() => {
          this._onDelete()
        }}
        icon={'trash-o'} />
    )

    let rightNavButtons = (
      <View style={AppStyles.rightNavButtons}>
        {mediumRightNavButton}
        {farRightNavButton}
      </View>
    )

    return (
      <NavigationBar
        title={<NavbarTitle title={title || null} />}
        statusBar={{style: 'light-content', hidden: false}}
        style={[AppStyles.navbar]}
        tintColor={AppConfig.primaryColor}
        leftButton={leftNavBarButton}
        rightButton={rightNavButtons}/>
    )
  }

  render = () => {

    /*

    TODO

    <View>
      <Text style={[AppStyles.baseText]}>Priority</Text>
      <TextInput
        style={[AppStyles.baseText]}
        onChangeText={(updatedNotes) => this.setState({
          currenNotes: updatedNotes
        })}
        value={this.state.currentNotes}/>
    </View>

    <View>
      <Text style={[AppStyles.baseText]}>Recurring Status</Text>
      <TextInput
        style={[AppStyles.baseText]}
        onChangeText={(updatedNotes) => this.setState({
          currenNotes: updatedNotes
        })}
        value={this.state.currentNotes}/>
    </View>
    */


    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}>

        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Name</Text>
            <TextInput
              style={[AppStyles.baseText]}
              onChangeText={(updatedName) => {
                let task = this.state.task
                task.name = updatedName
                this.setState({ task: task })
              }}
              value={this.state.task.name}/>
            <Text style={[AppStyles.errorText]}>
              {this.state.nameValidationError}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>List</Text>
            <Picker
              selectedValue={this.state.task.listId}
              onValueChange={(updatedParentListId) => {
                let task = this.state.task
                task.listId = updatedParentListId
                this.setState({task: task})
              }}>
              {this._getListNames()}
            </Picker>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Notes</Text>
            <TextInput
              style={[AppStyles.baseText]}
              onChangeText={(updatedNotes) => {
                let task = this.state.task
                task.notes = updatedNotes
                this.setState({ task: task })
              }}
              value={this.state.task.notes}/>

            <Text style={[AppStyles.errorText]}>
              {this.state.notesValidationError}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
          <Text style={[AppStyles.baseText]}>Due Date</Text>
          <TouchableOpacity
            style={[ AppStyles.paddingRight, AppStyles.paddingLeft]}
            onPress={this._showDatePicker.bind(this)}>
              {this._currentDateToText()}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists,
  tasks: state.entities.tasks,
})

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  deleteTask: TaskActions.deleteTask,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTask)
