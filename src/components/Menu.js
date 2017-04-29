/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */
import React, { Component, PropTypes } from 'react'
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native'
import { connect } from 'react-redux'

import * as ProfileStorage from '../models/storage/profile-storage'

import * as SideMenuActions from '../actions/ui/sidemenu'
import * as UserActions from '../actions/entities/user'
import * as TaskActions from '../actions/entities/task'

import AppStyles from '../styles'
import AppConfig from '../config'
import AppConstants from '../constants'

import MultiTaskPage from './screens/MultiTaskPage'
import Profile from './screens/Profile'
import About from './screens/About'
import Login from './screens/Login'
import Signup from './screens/Signup'

class Menu extends Component {

  static propTypes = {
    navigate: PropTypes.func.isRequired,
  }

  _navigateToProfileIfLoggedIn = (props) => {

    let { navigate } = this.props;

    if (this.props.isLoggedIn) {
        navigate('Profile', Profile, props) // user is logged in; go to profile
    } else {
      // TODO - clean up the assumption that navigate will be available
      // TODO - move this dialog to its own file
      Alert.alert(
        `Welcome to ${AppConstants.APP_NAME}!`,
        'You must login or signup before accessing your profile.',
        [
          {
            text: 'Close',
            onPress: () => { /* do nothing */ }
          },
          {
            text: 'Signup',
            onPress: () => {
              navigate('Signup', Signup, props)
            }
          },
          {
            text: 'Login',
            onPress: () => {
              navigate('Login', Login, props)
            }
          },
        ],
        { cancelable: false }
      )
    }
  }

  _constructMenuItems = () => {
    let { navigate } = this.props;

    let menuItems = [];

    menuItems.push(
      <TouchableOpacity key={`menu-item-all-tasks`}
        onPress={()=> {
          navigate('All Tasks', MultiTaskPage)
        }}>
        <View style={[styles.menuItem]}>
          <Text style={[AppStyles.baseText, styles.menuItemText]}>
            {'Tasks'}
          </Text>
        </View>
      </TouchableOpacity>
    )

    /*
    menuItems.push(
      <TouchableOpacity key={'menu-item-store'}
        onPress={()=>navigate('Store', Store, this.props)}>
        <View style={[styles.menuItem]}>
          <Text style={[AppStyles.baseText, styles.menuItemText]}>{'Store'}</Text>
        </View>
      </TouchableOpacity>
      // TODO - store
      // TODO - settings
    )
    */

    menuItems.push(
      <TouchableOpacity key={'menu-item-profile'}
        onPress={()=>this._navigateToProfileIfLoggedIn(this.props)}>
        <View style={[styles.menuItem]}>
          <Text style={[AppStyles.baseText, styles.menuItemText]}>{'Profile'}</Text>
        </View>
      </TouchableOpacity>
    )

    menuItems.push(
      <TouchableOpacity key={'menu-item-about'}
        onPress={()=>navigate('About', About, this.props)}>
        <View style={[styles.menuItem]}>
          <Text style={[AppStyles.baseText, styles.menuItemText]}>{'About'}</Text>
        </View>
      </TouchableOpacity>
    )

    // show logout menu-item
    if (this.props.isLoggedIn) {
      menuItems.push(
        <TouchableOpacity key={'menu-item-logout'}
          onPress={()=>{

            Alert.alert(
              '',
              'Are you sure you want to logout?',
              [
                {
                  text: 'Close',
                  onPress: () => { /* do nothing */ }
                },
                {
                  text: 'Yes',
                  onPress: () => {
                    // remove profile and all entities
                    this.props.deleteProfile()
                    this.props.deleteAllTasks()
                    ProfileStorage.logout()

                     // logout requires ui update
                    navigate('All Tasks', MultiTaskPage)
                  }
                },
              ],
            )
          }}>
          <View style={[styles.menuItem]}>
            <Text style={[AppStyles.baseText, styles.menuItemText]}>{'Logout'}</Text>
          </View>
        </TouchableOpacity>
      )
    }

    return menuItems;
  }

  _renderUserDetails = () => {

    let greeting = ''

    /*
    TODO - refine
    if (this.props.isLoggedIn && this.props.profile.name) {
      greeting = `Hello, ${this.props.profile.name}!`;
    }
    */

    // TODO - set streak info, points, etc

    return <View style={[AppStyles.padding, styles.userGreeting]}>

      <Text style={[AppStyles.baseText, styles.userGreetingText]}>
        {greeting}
      </Text>
    </View>
  }

  render = () => {
    const menuItems = this._constructMenuItems()

    // TODO - render a greeting
    /*
      {this._renderUserDetails()}

      <View style={[AppStyles.divider]}/>
    */

    return (
      <ScrollView
        scrollEnabled={false}
        automaticallyAdjustContentInsets={false}
        ref={'scrollView'}
        style={[AppStyles.container]}
        contentContainerStyle={[styles.containerCentered, styles.containerStretched]}>
        <View style={[styles.menuContainer]}>

          <View style={[styles.menu]}>{menuItems}</View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    left: 0,
    right: 0,
    backgroundColor: 'black',
  },
  menu: {
    left: 0,
    right: 0,
    height: AppConfig.windowHeight,
    backgroundColor: 'black',
    padding: 10,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: AppConfig.borderColor,
    paddingBottom: 20,
  },
  menuItemText: {
    marginTop: 20,
    color: AppConfig.primaryColor,
  },
  menuSubItem: {
    paddingBottom: 15,
  },
  menuSubItemText: {
    fontSize: 18,
    paddingLeft: 20,
    fontWeight: '500',
    marginTop: 15,
    color: 'white'
  },
  menuSubItemLinkText: {
    fontSize: 18,
    paddingLeft: 20,
    fontWeight: '500',
    marginTop: 15,
    color: AppConfig.linkColor
  },
  userGreetingText: {
    color: 'white'
  },
  icon: {
    marginTop: 22,
    width: 26,
    height: 26,
  },
})

const mapStateToProps = (state) => ({
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  isSyncing: state.sync.isSyncing,
})

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  closeSideMenu: SideMenuActions.closeSideMenu,
  deleteProfile: UserActions.deleteProfile,
  deleteAllTasks: TaskActions.deleteAllTasks,
  //startSync: SyncActions.startSync,
  //stopSync: SyncActions.stopSync,
  //sync: SyncActions.sync
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
