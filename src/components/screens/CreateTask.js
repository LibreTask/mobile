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

import Validator from 'validator'

import * as TaskActions from '../../actions/entities/task'
import * as TaskController from '../../models/controllers/task'
import * as TaskStorage from '../../models/storage/task-storage'
import * as UserController from '../../models/controllers/user'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import AppConfig from '../../config'
import AppStyles from '../../styles'
import AppConstants from '../../constants'

class CreateTask extends Component {
	static componentName = 'CreateTask'

   static propTypes = {
     listId: PropTypes.string,
   }

  constructor(props) {
    super(props)

    this.state = {
      creationError: '',
      isCreatingTask: false,
      taskName: '',
      nameValidationError: ''
    }
  }

  _createTask = async () => {
    if (this.state.isCreatingTask) {
      // TODO - warn
      return;
    }

    var taskName = this.state.taskName || ''

    let nameValidationError = ''

    if (!Validator.isLength(taskName, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (nameValidationError) {
      this.setState({ nameValidationError: nameValidationError })

      return; // validation failed; cannot create task
    }

    if (UserController.canAccessNetwork(this.props.profile)) {

      this.setState({
        isCreatingTask: true,
        creationError: '',
        nameValidationError: ''
      }, () => {

        TaskController.createTask(taskName, this.props.listId,
           this.props.profile.id, this.props.profile.password)
        .then(response => {

            let task = response.task

            TaskStorage.createOrUpdateTask(task)
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
            })
          }
        })
      })
    } else {
      this._createTaskLocallyAndRedirect(taskName)
    }
  }

  _createTaskLocallyAndRedirect = (name) => {
    let task = TaskController.constructTaskLocally(name, this.props.listId)
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)
    this.props.navigator.pop()
  }

  _constructNavbar = () => {

    let title = 'Create Task'
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={()=>{
          this.props.navigator.pop()
        }}
        icon={'arrow-left'} />
    )

    return (
      <NavigationBar
        title={<NavbarTitle title={title || null} />}
        statusBar={{style: 'light-content', hidden: false}}
        style={[AppStyles.navbar]}
        tintColor={AppConfig.primaryColor}
        leftButton={leftNavBarButton}/>
    )
  }

  render = () => {
    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        ref={'scrollView'}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}>

        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>

        <View style={[AppStyles.paddingVertical]}>
          <Text style={[AppStyles.baseText]}>Name</Text>
          <TextInput
            style={[AppStyles.baseText]}
            onChangeText={(updatedName) => {
              this.setState({ taskName: updatedName })
            }}
            value={this.state.taskName}/>

          <Text style={[AppStyles.errorText]}>
            {this.state.nameValidationError}
          </Text>
        </View>

          <View style={[AppStyles.row]}>

            <View style={[AppStyles.button]}>
              <Button
                title={"Create Task"}
                onPress={this._createTask} />
            </View>
          </View>
        </View>

      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
})

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTask)
