/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Button,
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput
} from 'react-native'
import { connect } from 'react-redux'

import * as TaskActions from '../../actions/entities/task'
import * as TaskController from '../../models/controllers/task'
import * as TaskStorage from '../../models/storage/task-storage'
import * as UserController from '../../models/controllers/user'

import AppStyles from '../../styles'

class CreateTask extends Component {
	static componentName = 'CreateTask';

   static propTypes = {
     listId: PropTypes.string,
   }

  constructor(props) {
    super(props);

    this.state = {
      creationError: '',
      isCreatingTask: false,
      taskName: ''
    }
  }

  _createTask = async () => {
    if (this.state.isCreatingTask) {
      // TODO - warn
      return;
    }

    var taskName = this.state.taskName

    // TODO - validate
    if (UserController.canAccessNetwork(this.props.profile)) {

      this.setState({isCreatingTask: true,
         creationError: ''}, () => {

        TaskController.createTask(taskName, this.props.listId,
           this.props.profile.id, this.props.profile.password)
        .then(response => {

            let task = response.task

            TaskStorage.createOrUpdateTask(task);
            this.props.createOrUpdateTask(task)

            this.props.navigator.pop()
        })
        .catch(error => {

          if (error.name === 'NoConnection') {
            this._createTaskLocallyAndRedirect(taskName)
          } else {
            this.setState({
              creationError: error.message,
              isCreatingTask: false
            });
          }
        })
      });

    } else {
      this._createTaskLocallyAndRedirect(taskName)
    }
  }

  _createTaskLocallyAndRedirect = (name) => {
    let task = TaskController.constructTaskLocally(name, this.props.listId)
    TaskStorage.createOrUpdateTask(task);
    this.props.createOrUpdateTask(task)

    this.props.navigator.pop()
  }

  render = () => {
    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        ref={'scrollView'}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}>
        <View style={[AppStyles.padding]}>

          <Text style={[AppStyles.baseText]}>Name</Text>
          <TextInput
            style={[AppStyles.baseTextSmall]}
            onChangeText={(updatedName) => {
              this.setState({ taskName: updatedName })
            }}
            value={this.state.taskName}/>

          <View style={[AppStyles.row]}>

            <View style={[AppStyles.button]}>
              <Button
                title={"Create Task"}
                onPress={this._createTask} />
            </View>
          </View>
        </View>

      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
});

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateTask);
