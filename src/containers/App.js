/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import {
  Navigator,
  NetInfo,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { connect } from 'react-redux'
import NavigationBar from 'react-native-navbar'
import SideMenu from 'react-native-side-menu'

import * as _ from 'lodash'

import * as SideMenuActions from '../actions/sidemenu'
import * as UserController from '../models/controllers/user'
import * as ListController from '../models/controllers/list'

import * as ListStorage from '../models/storage/list-storage'
import * as ProfileStorage from '../models/storage/profile-storage'
import * as TaskStorage from '../models/storage/task-storage'

import * as UserActions from '../actions/entities/user'
import * as TaskActions from '../actions/entities/task'
import * as ListActions from '../actions/entities/list'

import * as NavbarActions from '../actions/navbar'
import * as SyncActions from '../actions/sync'

import AppStyles from '../styles'
import AppConfig from '../config'
import AppConstants from '../constants'

import Menu from '../components/Menu'
import NavbarTitle from '../components/navbar/NavbarTitle'
import NavbarButton from '../components/navbar/NavbarButton'

import MultiTaskPage from '../components/screens/MultiTaskPage'

class AppContainer extends Component {

  constructor(props) {
    super(props)

    this.state = {

      // no list is initially selected
      currentlySelectedList: AppConstants.ALL_TASKS_IDENTIFIER
    }
  }

  componentDidMount = async () => {
    StatusBar.setHidden(false, 'slide') // Slide in on load
    StatusBar.setBackgroundColor(AppConfig.primaryColor, true)

    await this._loadInitialState()
  }

  shouldComponentUpdate(nextProps, nextState) {

    if (!_.isEqual(this.props, nextProps)) {
      return true;
    }

    return false;
  }

  // TODO - move this logic to file like index.js
  _loadInitialState = async () => {
    let tasks = {}
    let lists = {}
    let profile = {}

    try {
      tasks = await TaskStorage.getAllTasks()
    } catch (err) { /* ignore */ }

    try {
      lists = await ListStorage.getAllLists()
    } catch (err) { /* ignore */ }

    try {
      profile = await ProfileStorage.getMyProfile()
    } catch (err) { /* ignore */ }


    this.props.createOrUpdateTasks(tasks)
    this.props.createOrUpdateLists(lists)


    // TODO - what else should we validate?
    if (profile) {
      this.props.createOrUpdateProfile(profile)
    }
  }

  // TODO - fix this hack
  _onListSelection = (listId) => {
    this.setState({ currentlySelectedList: listId })
  }

  _onSideMenuPress = (title, component, extraProps) => {
    this.props.closeSideMenu()

    this.refs.rootNavigator.popToTop()
    this.refs.rootNavigator.replace({
      title: title,
      component: component,
      index: 0,
      passProps: extraProps || {}
    })
  }

  _onSideMenuChange = (isOpen) => {
    if (isOpen != this.props.sideMenuIsOpen) {
      this.props.toggleSideMenu()
    }
  }

  _leftNavBarButton = (route) => {
    // Show Hamburger Icon when index is 0,
    // and Back Arrow Icon when index is > 0
    let leftButton = {
      onPress: (route.index > 0)
        ? this.refs.rootNavigator.pop
        : this.props.toggleSideMenu,
      icon: (route.index > 0)
        ? 'arrow-left'
        : 'bars'
    }

    // Show a cross icon when transition pops from bottom
    if(route.transition == 'FloatFromBottom')  {
      leftButton.icon = 'arrow-left'
    }

    return <NavbarButton
        navButtonLocation={NavbarButton.LEFT_RIGHT_NAV_BUTTON}
        onPress={leftButton.onPress}
        icon={leftButton.icon} />
  }

  _constructMediumRightNavButton() {
    let mediumRightNavIcon
    let navbarAction

    if (this.props.mediumRightNavButton
      === AppConstants.EDIT_NAVBAR_BUTTON) {
      mediumRightNavIcon = 'edit'
      navbarAction = NavbarActions.EDIT_NAV_ACTION
    } else if (this.props.mediumRightNavButton
      === AppConstants.DELETE_NAVBAR_BUTTON) {
        mediumRightNavIcon = 'trash-o'
        navbarAction = NavbarActions.DELETE_NAV_ACTION
    } else if (this.props.mediumRightNavButton
      === AppConstants.SAVE_NAVBAR_BUTTON) {
        mediumRightNavIcon = 'floppy-o'
        navbarAction = NavbarActions.SAVE_NAV_ACTION
    } else {
      return // no navbutton set; return nothing
    }


        console.log("medium right nav icon: " + mediumRightNavIcon)

    return (
      <NavbarButton
          navButtonLocation={NavbarButton.MEDIUM_RIGHT_NAV_BUTTON}
          onPress={() => {
              this.props.setNavAction(navbarAction)
          }}
          icon={mediumRightNavIcon} />
    )
  }

  _constructFarRightNavButton() {
    let farRightNavIcon
    let navbarAction

    console.log("far right nav button: " + this.props.farRightNavButton)
    console.log("medium right nav button: " + this.props.mediumRightNavButton)

    if (this.props.farRightNavButton
      === AppConstants.EDIT_NAVBAR_BUTTON) {
      farRightNavIcon = 'edit'
      navbarAction = NavbarActions.EDIT_NAV_ACTION
    } else if (this.props.farRightNavButton
      === AppConstants.DELETE_NAVBAR_BUTTON) {
        farRightNavIcon = 'trash-o'
        navbarAction = NavbarActions.DELETE_NAV_ACTION
    } else if (this.props.farRightNavButton
      === AppConstants.SAVE_NAVBAR_BUTTON) {
        farRightNavIcon = 'floppy-o'
        navbarAction = NavbarActions.SAVE_NAV_ACTION
    } else {
      return // no navbutton set; return nothing
    }

    console.log("far right nav icon: " + farRightNavIcon)

    return (
      <NavbarButton
          navButtonLocation={NavbarButton.FAR_RIGHT_NAV_BUTTON}
          onPress={() => {
              this.props.setNavAction(navbarAction)
          }}
          icon={farRightNavIcon} />
    )
  }

  _renderScene = (route, navigator) => {
    let title = route.title || AppConstants.APP_NAME

    let leftNavBarButton = this._leftNavBarButton(route)
    let mediumRightNavButton = this._constructMediumRightNavButton()
    let farRightNavButton = this._constructFarRightNavButton()

    /*
    rightButton={<View>
      {mediumRightNavButton}
      {farRightNavButton}
    </View>}/>
    */

    return (
      <View style={[AppStyles.container]}>
        <NavigationBar
          title={<NavbarTitle title={title || null} />}
          statusBar={{style: 'light-content', hidden: false}}
          style={[AppStyles.navbar]}
          tintColor={AppConfig.primaryColor}
          leftButton={leftNavBarButton}
          rightButton={farRightNavButton}/>

        <route.component
          navigator={navigator}
          route={route}
          {...route.passProps} />
      </View>
    )
  }

  render() {

    return (
      <SideMenu
        ref="rootSidebarMenu"
        menu={<Menu
          navigate={this._onSideMenuPress}
          onListSelection={this._onListSelection}
          ref="rootSidebarMenuMenu" />
        }
        disableGestures={this.props.sideMenuGesturesDisabled}
        isOpen={this.props.sideMenuIsOpen}
        onChange={this._onSideMenuChange}>

        <Navigator
          ref="rootNavigator"
          style={[AppStyles.container]}
          renderScene={this._renderScene}
          configureScene={function(route, routeStack) {
            if(route.transition == 'FloatFromBottom')
              return Navigator.SceneConfigs.FloatFromBottom;
            else
              return Navigator.SceneConfigs.PushFromRight;
          }}
          initialRoute={{
            title: 'All Tasks',
            component: MultiTaskPage,
            index: 0,
            navigator: this.refs.rootNavigator,
          }} />

      </SideMenu>
    )
  }
}

const mapStateToProps = (state) => ({
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  mediumRightNavButton: state.ui.navbar.mediumRightButton,
  farRightNavButton: state.ui.navbar.farRightButton,
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  isSyncing: state.sync.isSyncing
})

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  closeSideMenu: SideMenuActions.closeSideMenu,
  createOrUpdateTasks: TaskActions.createOrUpdateTasks,
  createOrUpdateLists: ListActions.createOrUpdateLists,
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  deleteAllLists: ListActions.deleteAllLists,
  deleteAllTasks: TaskActions.deleteAllTasks,
  startSync: SyncActions.startSync,
  stopSync: SyncActions.stopSync,
  sync: SyncActions.sync
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
