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

import * as SideMenuActions from '../../actions/sidemenu'
import * as UserActions from '../../actions/entities/user'
import * as UserController from '../../models/controllers/user'
import * as ProfileStorage from '../../models/storage/profile-storage'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import AppConfig from '../../config'
import AppStyles from '../../styles'
import AppConstants from '../../constants'

import MultiTaskPage from './MultiTaskPage'

class Profile extends Component {
	static componentName = 'Profile'

  constructor(props) {
    super(props)

    this.state = {
      isUpdating: false,
      updateError: '',
      updateSuccess: '',
      myProfile: this.props.profile
    }
  }

  _onAccountUpgrade = () => {
    // TODO - collect user payment information with dialog
    let userId = this.state.myProfile.id
    let pw = this.state.myProfile.password
    UserController.upgradeAccount(userId, pw)
    .then(response => {

      let profile = this.props.profile
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
        updateSuccess: ''
      })
    })
  }

  _onAccountDowngrade = () => {
    let userId = this.state.myProfile.id
    let pw = this.state.myProfile.password
    UserController.downgradeAccount(userId, pw)
    .then(response => {
      let profile = this.props.profile
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
            UserController.deleteProfile(this.props.profile)
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
    ProfileStorage.deleteProfile()
    this.props.deleteProfile()

     // profile deletion ui update
     this.props.navigator.replace({
       title: 'Main',
       component: MultiTaskPage,
       index: 0,
       passProps: {
         isLoggedIn: false,

         // TODO fix passing in empty object to satisfy props constraint
         myProfile: {}
       }
     })
  }

  _onSubmitEdit = async () => {

    // TODO - validate input

    this.setState({isUpdating: true, updateSuccess: '', updateError: ''})

    UserController.updateProfile(this.state.myProfile)
    .then(response => {

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

    if (this.state.myProfile.currentPlan === 'premium') {
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

    let title = 'Task View'
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

  render = () => {

    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}>

        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>
          <Text style={[AppStyles.baseText]}>
            Name
          </Text>
          <TextInput
            style={[AppStyles.baseText]}
            onChangeText={(updatedName) => {
              let profile = this.state.myProfile
              profile.name = updatedName
              this.setState({ myProfile: profile })
            }}
            value={this.state.myProfile.name}/>

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
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
})

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
