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
  TextInput,
  ScrollView
} from 'react-native'
import { connect } from 'react-redux'

import * as SideMenuActions from '../../actions/ui/sidemenu'
import * as UserActions from '../../actions/entities/user'
import * as UserController from '../../models/controllers/user'
import * as ProfileStorage from '../../models/storage/profile-storage'
import * as TaskActions from '../../actions/entities/task'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import AppConfig from '../../config'
import AppStyles from '../../styles'
import AppConstants from '../../constants'

import moment from 'moment'

import Validator from 'validator'

import MultiTaskPage from './MultiTaskPage'

class Profile extends Component {
	static componentName = 'Profile'

  constructor(props) {
    super(props)

    this.state = {
      isUpdating: false,
      updateError: '',
      updateSuccess: '',
      emailValidationError: '',
      myProfile: this.props.user.profile
    }
  }

  _onAccountUpgrade = () => {
    // TODO - collect user payment information with dialog
    let userId = this.state.myProfile.id
    let pw = this.state.myProfile.password
    UserController.upgradeAccount(userId, pw)
    .then(response => {

      let profile = this.props.user.profile
      profile.plan = 'premium' // TODO - constants

      ProfileStorage.createOrUpdateProfile(profile)
      this.props.createOrUpdateProfile(profile)

      // update profile stored in state variable
      let stateProfile = this.state.myProfile
      myProfile.plan = 'premium'
      this.setState({myProfile: stateProfile})
    })
    .catch(error => {
      this.setState({
        isUpdating: false,
        updateError: error.message,
        updateSuccess: '',
      })
    })
  }

  _onAccountDowngrade = () => {
    let userId = this.state.myProfile.id
    let pw = this.state.myProfile.password
    UserController.downgradeAccount(userId, pw)
    .then(response => {
      let profile = this.props.user.profile
      profile.plan = 'basic' // TODO - constants

      ProfileStorage.createOrUpdateProfile(profile)
      this.props.createOrUpdateProfile(profile)

      // update profile stored in state variable
      let stateProfile = this.state.myProfile
      myProfile.plan = 'premium'
      this.setState({myProfile: stateProfile})
    })
    .catch(error => {
      this.setState({
        isUpdating: false,
        updateError: error.message,
        updateSuccess: ''
      })
    })
  }

  _onDelete = () => {
    Alert.alert(
      '',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Close',
          onPress: () => { /* do nothing */ }
        },
        {
          text: 'Yes',
          onPress: async () => {
            UserController.deleteProfile(this.state.myProfile)
              .then(response => {
                this._deleteProfileLocallyAndRedirect()
              })
              .catch(error => {
                if (error.name === 'NoConnection') {
                  this._deleteProfileLocallyAndRedirect()
                } else {
                  // TODO
                }
              })
          }
        },
      ],
    )
  }

  _deleteProfileLocallyAndRedirect = () => {
    this.props.deleteProfile()
    this.props.deleteAllTasks()
    ProfileStorage.logout()

     // profile deletion ui update
     this.props.navigator.replace({
       title: 'Main',
       component: MultiTaskPage,
       index: 0,
     })
  }

  _onSubmitEdit = async () => {

    let updatedEmail = this.state.myProfile.email || ''

    let emailValidationError = ''

    if (!Validator.isEmail(updatedEmail)) {
      emailValidationError = 'Email is not valid'
    }

    if (emailValidationError) {
      this.setState({
        updateError: '',
        updateSuccess: '',
        emailValidationError: emailValidationError,
      })

      return; // validation failed; cannot updated profile
    }

    this.setState({
      isUpdating: true,
      updateSuccess: '',
      updateError: '',
      emailValidationError: '',
    })

    UserController.updateProfile(this.state.myProfile)
    .then(response => {

        // TODO - handle password better
        response.password = this.props.user.password

        ProfileStorage.createOrUpdateProfile(response.profile)
        this.props.createOrUpdateProfile(response.profile)

        this.setState({
          updateSuccess: 'Update successful!',
          isUpdated: false
        })

        setTimeout(() => {
          this.setState({ updateSuccess: '' })
        }, 1500) // remove message after 1.5 seconds
    })
    .catch(error => {
      this.setState({
        isUpdating: false,
        updateError: error.message,
        updateSuccess: ''
      })
    })
  }

  _getAccountStatusButton = () => {
    let accountStatusButton;

    if (this._hasPremiumSubscription()) {
      accountStatusButton = (
        <View style={[AppStyles.row]}>
          <View style={[AppStyles.button]}>
            <Button
              title='Downgrade'
              onPress={()=> {
                this._onAccountDowngrade()
              }} />
          </View>
        </View>
      )
    } else {
      accountStatusButton = (
        <View style={[AppStyles.row]}>
          <View style={[AppStyles.button]}>
            <Button
              title='Upgrade'
              onPress={()=> {
                this._onAccountUpgrade()
              }} />
          </View>
        </View>
      )
    }

    return accountStatusButton
  }

  _constructNavbar = () => {

    let title = 'Profile'
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={()=>{
          this.props.toggleSideMenu()
        }}
        icon={'bars'} />
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

  _hasPremiumSubscription = () => {
    let today = new Date()

    return this.state.myProfile
      && this.state.myProfile.currentPlan === 'premium'
      && new Date(this.state.myProfile.planExpirationDateTimeUtc) > today
  }

  _expirationDateDisplay = () => {

    if (this._hasPremiumSubscription()) {

      let planExpirationDateTimeUtc =
        this.state.myProfile.planExpirationDateTimeUtc

      let formattedExpirationDate = planExpirationDateTimeUtc ?
        moment(planExpirationDateTimeUtc).format('LLLL')
        : 'An error has occurred, please check back later'

        // Styling here is intended to be identical to a non-disabled TextField.
        return (
          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>
              Premium Plan Expiration
            </Text>
            <Text style={[AppStyles.baseText]}>
              {formattedExpirationDate}
            </Text>
          </View>
        )
    } else {
      return (<View/>)
    }
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
            <Text style={[AppStyles.baseText]}>
              Email
            </Text>
            <TextInput
              style={[AppStyles.baseText]}
              onChangeText={(updatedEmail) => {
                let profile = this.state.myProfile
                profile.email = updatedEmail
                this.setState({ myProfile: profile })
              }}
              value={this.state.myProfile.email}/>
            <Text style={[AppStyles.errorText]}>
              {this.state.emailValidationError}
            </Text>
          </View>

          {this._expirationDateDisplay()}

          <View style={[AppStyles.row]}>
            <View style={[AppStyles.button]}>
              <Button
                title='Save'
                onPress={()=> {
                  this._onSubmitEdit()
                }} />
            </View>
          </View>
          <View style={[AppStyles.row]}>
            <View style={[AppStyles.button]}>
              <Button
                title='Delete'
                onPress={()=> {
                  this._onDelete()
                }} />
            </View>
          </View>
          {this._getAccountStatusButton()}
        </View>
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  user: state.entities.user
})

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  deleteAllTasks: TaskActions.deleteAllTasks,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
