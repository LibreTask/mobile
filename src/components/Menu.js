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

import * as SideMenuActions from '../actions/sidemenu'
import * as SyncActions from '../actions/sync'
import * as UserActions from '../actions/entities/user'
import * as TaskActions from '../actions/entities/task'
import * as ListActions from '../actions/entities/list'

import AppStyles from '../styles'
import AppConfig from '../config'
import AppConstants from '../constants'

import MultiTaskPage from './screens/MultiTaskPage'
import CreateList from './screens/CreateList'
import Profile from './screens/Profile'
import About from './screens/About'
import Login from './screens/Login'
import Signup from './screens/Signup'

class Menu extends Component {

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    onListSelection: PropTypes.func.isRequired // TODO - fix this hack
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
      );
    }
  }

  _getListsMenuItems = () => {

    let { navigate } = this.props;

    let listsArrowImage =
      this.props.sideMenuListsViewIsCollapsed
      ? require('../images/arrow_right_white.png')
      : require('../images/arrow_down_white.png')

    let listsMenuItems = [];

    if (!this.props.sideMenuListsViewIsCollapsed) {

      for (let listId in this.props.lists) {
        let list = this.props.lists[listId]

        listsMenuItems.push(
          <TouchableOpacity key={`menu-item-create-${list.name}`}
            onPress={()=> {
              this.props.onListSelection(list.id)
              navigate(list.name, MultiTaskPage, {listId: list.id})
            }}>
            <View style={[styles.menuSubItem]}>
              <Text style={[AppStyles.baseText, styles.menuSubItemText]}>
                {list.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }

      listsMenuItems.push(
        <TouchableOpacity key={'menu-item-create-list'}
          onPress={()=>navigate('Create List', CreateList, this.props)}>
          <View style={[styles.menuSubItem]}>
            <Text style={[AppStyles.baseText, styles.menuSubItemLinkText]}>
              + New
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity key={'menu-item-lists'}
        onPress={()=>this.props.toggleListsView()}>
        <View style={[styles.menuItem]}>
          <View style={[AppStyles.row]}>
            <View>
              <Image key={'list-collapse-image'} style={styles.icon} source={listsArrowImage} />
            </View>
            <View >
              <Text style={[AppStyles.baseText, styles.menuItemText]}>Lists</Text>
              {listsMenuItems}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _constructMenuItems = () => {
    let { navigate } = this.props;

    let menuItems = [];

    menuItems.push(
      <TouchableOpacity key={`menu-item-all-tasks`}
        onPress={()=> {
          this.props.onListSelection(AppConstants.ALL_TASKS_IDENTIFIER)
          navigate('All Tasks', MultiTaskPage)
        }}>
        <View style={[styles.menuItem]}>
          <Text style={[AppStyles.baseText, styles.menuItemText]}>
            {'All Tasks'}
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
    );
    */

    menuItems = menuItems.concat(this._getListsMenuItems())

    menuItems.push(
      <TouchableOpacity key={'menu-item-profile'}
        onPress={()=>this._navigateToProfileIfLoggedIn(this.props)}>
        <View style={[styles.menuItem]}>
          <Text style={[AppStyles.baseText, styles.menuItemText]}>{'Profile'}</Text>
        </View>
      </TouchableOpacity>
    );

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
                    this.props.deleteProfile();
                    this.props.deleteAllTasks();
                    this.props.deleteAllLists();
                    ProfileStorage.logout();

                     // logout requires ui update
                    navigate('Tasks', MultiTaskPage, {
                      listId: AppConstants.ALL_TASKS_IDENTIFIER,
                    });
                  }
                },
              ],
            );
          }}>
          <View style={[styles.menuItem]}>
            <Text style={[AppStyles.baseText, styles.menuItemText]}>{'Logout'}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return menuItems;
  }

  _renderUserDetails = () => {

    let greeting = 'Hello!';

    if (this.props.isLoggedIn && this.props.profile.name) {
      greeting = `Hello, ${this.props.profile.name}!`;
    }

    // TODO - set streak info, points, etc

    return <View style={[AppStyles.padding, styles.userGreeting]}>

      <Text style={[AppStyles.baseText, styles.userGreetingText]}>
        {greeting}
      </Text>
    </View>
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.sideMenuListsViewIsCollapsed
              !== this.props.sideMenuListsViewIsCollapsed) {
      this.setState({
        sideMenuListsViewIsCollapsed: nextProps.sideMenuListsViewIsCollapsed
      });
    }
  }

  render = () => {
    const menuItems = this._constructMenuItems();

    // TODO - render a greeting
    /*
      {this._renderUserDetails()}

      <View style={[AppStyles.divider]}/>
    */

    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        ref={'scrollView'}
        style={[AppStyles.container]}
        contentContainerStyle={[styles.containerCentered, styles.containerStretched]}>
        <View style={[styles.menuContainer]}>

          <View style={[styles.menu]}>{menuItems}</View>
        </View>
      </ScrollView>
    );
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
});

const mapStateToProps = (state) => ({
  sideMenuListsViewIsCollapsed: state.ui.sideMenu.isListsViewCollapsed,
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  isSyncing: state.sync.isSyncing,
  lists: state.entities.lists
});

const mapDispatchToProps = {
  toggleListsView: SideMenuActions.toggleListsView,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  closeSideMenu: SideMenuActions.closeSideMenu,
  deleteProfile: UserActions.deleteProfile,
  deleteAllLists: ListActions.deleteAllLists,
  deleteAllTasks: TaskActions.deleteAllTasks,
  startSync: SyncActions.startSync,
  stopSync: SyncActions.stopSync,
  sync: SyncActions.sync
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
