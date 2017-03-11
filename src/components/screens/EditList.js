/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import { connect } from 'react-redux'

import * as ListActions from '../../actions/entities/list'
import * as ListController from '../../models/controllers/list'
import * as ListStorage from '../../models/storage/list-storage'
import * as UserController from '../../models/controllers/user'

import Validator from 'validator'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import AppConfig from '../../config'
import AppStyles from '../../styles'
import AppConstants from '../../constants'

import MultiTaskPage from './MultiTaskPage'

class EditList extends Component {
	static componentName = 'EditList'

  static propTypes = {
    listId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      updateError: '',
      updateSuccess: '',
      isUpdating: false,
      list: this._getList(),
      nameValidationError: ''
    }
  }

  _getList = () => {
    return this.props.lists[this.props.listId]
  }

  _onDelete = () => {
    Alert.alert(
      '',
      'Are you sure you want to delete this list?',
      [
        {
          text: 'Close',
          onPress: () => { /* do nothing */ }
        },
        {
          text: 'Yes',
          onPress: async () => {

            if (UserController.canAccessNetwork(this.props.profile)) {
              ListController.deleteList(
                this.props.listId,
                this.props.profile.id,
                this.props.profile.password
              )
              .then(response => {
                this._deleteListLocallyAndRedirect(this.props.listId)
              })
              .catch(error => {
                if (error.name === 'NoConnection') {
                  this._deleteListLocallyAndRedirect(this.props.listId)
                } else {
                  // TODO
                }
              })
            } else {
              this._deleteListLocallyAndRedirect(this.props.listId)
            }
          }
        },
      ],
    )
  }

  _deleteListLocallyAndRedirect = (listId) => {
    ListStorage.deleteListByListId(listId)
    this.props.deleteList(listId)

    this.props.navigator.replace({
      title: 'Main',
      component: MultiTaskPage,
      index: 0,
      passProps: {
        // after deleting list, return to all tasks identifier
        listId: AppConstants.ALL_TASKS_IDENTIFIER
      }
    })
  }

  _onSubmitEdit = () => {
    let profile = this.props.profile;

    let updatedListName = this.state.list.name || ''

    let nameValidationError = ''

    if (!Validator.isLength(updatedListName, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (nameValidationError) {
      this.setState({ nameValidationError: nameValidationError })

      return; // validation failed; cannot update list
    }

    this.setState({
      isUpdating: true,
      updateSuccess: '',
      updateError: '',
      nameValidationError: ''
    })

    if (UserController.canAccessNetwork(profile)) {
      ListController.updateList(this.state.list, profile.id, profile.password)
      .then(response => {
        this._editListLocally(response.list)
      })
      .catch(error => {

        if (error.name === 'NoConnection') {
          this._editListLocally(this.state.list)
        } else {
          this.setState({
            isUpdating: false,
            updateError: error.message,
            updateSuccess: ''
          })
        }
      })
    } else {
      this._editListLocally(this.state.list)
    }
  }

  _editListLocally = (list) => {
    ListStorage.createOrUpdateList(list)
    this.props.createOrUpdateList(list)

    this.setState({
      updateSuccess: 'Update successful!',
      isUpdated: false
    })

    setTimeout(() => {
      this.setState({ updateSuccess: '' })
    }, 1500) // remove message after 1.5 seconds
  }

  _constructNavbar = () => {

    let title = 'Edit List'
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
    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}>

        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>

          <Text style={[AppStyles.successText]}>
            {this.state.updateSuccess}
          </Text>

          <Text style={[AppStyles.errorText]}>
            {this.state.updateError}
          </Text>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Name</Text>
            <TextInput
              style={[AppStyles.baseText]}
              onChangeText={(updatedName) => {
                let list = this.state.list
                list.name = updatedName
                this.setState({ list: list })
              }}
              value={this.state.list.name}/>
            <Text style={[AppStyles.errorText]}>
              {this.state.nameValidationError}
            </Text>
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
})

const mapDispatchToProps = {
  createOrUpdateList: ListActions.createOrUpdateList,
  deleteList: ListActions.deleteList,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditList)
