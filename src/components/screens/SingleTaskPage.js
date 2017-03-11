/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'

import CheckBox from 'react-native-checkbox'
import dateFormat from 'dateformat'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import * as TaskActions from '../../actions/entities/task'
import * as TaskController from '../../models/controllers/task'
import * as TaskStorage from '../../models/storage/task-storage'
import * as UserController from '../../models/controllers/user'

import AppConfig from '../../config'
import AppStyles from '../../styles'
import AppConstants from '../../constants'
import EditTask from './EditTask'

class SingleTaskPage extends Component {
	static componentName = 'SingleTaskPage'

  static propTypes = {
    taskId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      task: this._getTask(),
      parentList: this._getList(),
    }
  }

  _getTask = () => {
    let id = this.props.taskId;
    return this.props.tasks[id]
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
                this.state.task.id,
                this.props.profile.id,
                this.props.profile.password
              )
              .then(response => {
                this._deleteTaskLocallyAndRedirect(this.state.task.id)
              })
              .catch(error => {
                if (error.name === 'NoConnection') {
                  this._deleteTaskLocallyAndRedirect(this.state.task.id)
                } else {
                  // TODO
                }
              })
            } else {
              this._deleteTaskLocallyAndRedirect(this.state.task.id)
            }
          }
        },
      ],
    )
  }

  _deleteTaskLocallyAndRedirect = (taskId) => {
    TaskStorage.deleteTaskByTaskId(taskId)
    this.props.deleteTask(taskId)
    this.props.navigator.pop()
  }

  _onEdit = () => {

    this.props.navigator.push({
      title: 'Edit Task',
      component: EditTask,
      index: 3,
      transition: 'FloatFromBottom',
      passProps: {
        taskId: this.state.task.id,
      }
    })
  }

  _notesBlock = () => {
    return (
      <View style={[AppStyles.paddingVertical]}>
        <Text style={[AppStyles.baseText]}>Notes</Text>
        <Text style={[AppStyles.baseTextSmall]}>
          {this.state.task.notes || 'No notes yet'}
        </Text>
      </View>
    )
  }

  _dueDateBlock = () => {
    return (
      <View style={[AppStyles.paddingVertical]}>
        <Text style={[AppStyles.baseText]}>Due Date</Text>
        <Text style={[AppStyles.baseTextSmall]}>
          {
            this.state.task.dueDateTimeUtc
            ? dateFormat(this.state.task.dueDateTimeUtc, 'mmmm d')
            : 'No due date yet'
          }
        </Text>
      </View>
    )
  }

  _priorityBlock = () => {
    let priorityBlock;
    if (this.state.task.priority) {
      priorityBlock = <View>
        <Text style={[AppStyles.baseText]}>
          Priority</Text>
        <Text>{this.state.task.priority}
        </Text>
      </View>
    }

    return priorityBlock
  }

  _recurringBlock = () => {
    let recurringBlock;
    if (this.state.task.recurringFrequency) {
      <View>
        <Text style={[AppStyles.baseText]}>
          Recurring Frequency
        </Text>
        <Text>{this.state.task.recurringFrequency}</Text>
      </View>
    }

    return recurringBlock
  }

  _updateTaskLocally = (task) => {
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)
    this.setState({ task: task })
  }

  _constructNavbar = () => {

    let title = 'Task View'
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
          this._onEdit()
        }}
        icon={'edit'} />
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
    <View style={[AppStyles.paddingVertical]}>
      <CheckBox
        label={'Completed'}
        labelStyle={[AppStyles.baseText]}
        checked={this.state.task.isCompleted}
        onChange={(checked) => {

          let updatedCheckedValue = !checked

          let task = this.state.task
          task.isCompleted = updatedCheckedValue

          if (UserController.canAccessNetwork(this.props.profile)) {
            TaskController.updateTask(task,
               this.props.profile.id, this.props.profile.password)
            .then(response => {
               this._updateTaskLocally(task)
            })
            .catch(error => {
              if (error.name === 'NoConnection') {
                 this._updateTaskLocally(task)
              } else {
                // TODO
              }
            })
          } else {
             this._updateTaskLocally(task)
          }
        }}
      />
    </View>
    */


    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}>

        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Name</Text>
            <Text style={[AppStyles.baseTextSmall]}>
              {this.state.task.name}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>List</Text>
            <Text style={[AppStyles.baseTextSmall]}>
              {this.state.parentList.name}
            </Text>
          </View>

          {this._notesBlock()}
          {this._dueDateBlock()}
          {this._priorityBlock()}
          {this._recurringBlock()}
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

export default connect(mapStateToProps, mapDispatchToProps)(SingleTaskPage)
