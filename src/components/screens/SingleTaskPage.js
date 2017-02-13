/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Button,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { connect } from 'react-redux'

import CheckBox from 'react-native-checkbox';

import * as TaskActions from '../../actions/entities/task'
import * as TaskController from '../../models/controllers/task'
import * as TaskStorage from '../../models/storage/task-storage'
import * as UserController from '../../models/controllers/user'

import AppStyles from '../../styles'
import EditTask from './EditTask'

class SingleTaskPage extends Component {
	static componentName = 'Task';

  static propTypes = {
    taskId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      task: this._getTask(),
      parentList: this._getList()
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
    );
  }

  _deleteTaskLocallyAndRedirect = (taskId) => {
    TaskStorage.deleteTaskByTaskId(taskId);
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
    });
  }

  _notesBlock = () => {
    let notesBlock;

    if (this.state.task.notes) {
      notesBlock = <View>
        <Text style={[AppStyles.baseText]}>Notes</Text>
        <Text>{this.state.task.notes}</Text>
      </View>
    }

    return notesBlock
  }

  _dueDateBlock = () => {
    let dueDateBlock;

    // TODO - refine how we format date (and move to utils)

    if (this.state.task.dueDateTimeUtc) {
      dueDateBlock = <View>
        <Text style={[AppStyles.baseText]}>Due Date</Text>
        <Text>{this.state.task.dueDateTimeUtc}</Text>
      </View>
    }

    return dueDateBlock
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
    TaskStorage.createOrUpdateTask(task);
    this.props.createOrUpdateTask(task)
    this.setState({ task: task })
  }

  render = () => {

    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}>

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

          {this._notesBlock()}
          {this._dueDateBlock()}
          {this._priorityBlock()}
          {this._recurringBlock()}

          <View style={[AppStyles.row]}>
            <View style={[AppStyles.button]}>
              <Button
                title={'Edit'}
                onPress={this._onEdit} />
            </View>

            <View style={[AppStyles.button]}>
              <Button
                title={'Delete'}
                onPress={this._onDelete} />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists,
  tasks: state.entities.tasks
});

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  deleteTask: TaskActions.deleteTask,
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleTaskPage);
