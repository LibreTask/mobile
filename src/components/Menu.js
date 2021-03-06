/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */
import React, { Component, PropTypes } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";

import * as SideMenuActions from "../actions/ui/sidemenu";
import * as UserActions from "../actions/entities/user";
import * as TaskActions from "../actions/entities/task";

import AppStyles from "../styles";
import AppConfig from "../config";
import AppConstants from "../constants";

import MultiTaskPage from "./screens/MultiTaskPage";
import Profile from "./screens/Profile";
import About from "./screens/About";
import Login from "./screens/Login";
import Signup from "./screens/Signup";

class Menu extends Component {
  static propTypes = {
    navigate: PropTypes.func.isRequired
  };

  _getMenuItemStyle = link => {
    return link === this.props.currentHighlightedLink
      ? styles.menuItemHighlighted
      : styles.menuItem;
  };

  _getMenuItemTextStyle = link => {
    return link === this.props.currentHighlightedLink
      ? styles.menuItemTextHighlighted
      : styles.menuItemText;
  };

  _navigateToProfileIfLoggedIn = props => {
    let { navigate } = this.props;

    if (this.props.isLoggedIn) {
      navigate("Profile", Profile, props); // user is logged in; go to profile
    } else {
      Alert.alert(
        "Login",
        "You must be logged in before you can complete this action.",
        [
          {
            text: "Signup",
            onPress: () => {
              navigate("Signup", Signup, props);
            }
          },
          {
            text: "Close",
            onPress: () => {
              // close the sidemenu
              this.props.toggleSideMenu();
            }
          },
          {
            text: "Login",
            onPress: () => {
              navigate("Login", Login, props);
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  _constructMenuItems = () => {
    let { navigate } = this.props;

    let menuItems = [];

    menuItems.push(
      <View key={`menu-item-all-tasks`}>
        <TouchableOpacity
          onPress={() => {
            navigate("All Tasks", MultiTaskPage);
          }}
        >
          <View style={this._getMenuItemStyle(SideMenuActions.TASKS_LINK)}>
            <Text
              style={[
                AppStyles.baseTextLargeLight,
                this._getMenuItemTextStyle(SideMenuActions.TASKS_LINK)
              ]}
            >
              {"Tasks"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );

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
      <View key={"menu-item-profile"}>
        <TouchableOpacity
          onPress={() => this._navigateToProfileIfLoggedIn(this.props)}
        >
          <View style={this._getMenuItemStyle(SideMenuActions.PROFILE_LINK)}>
            <Text
              style={[
                AppStyles.baseTextLargeLight,
                this._getMenuItemTextStyle(SideMenuActions.PROFILE_LINK)
              ]}
            >
              {"Profile"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );

    menuItems.push(
      <View key={"menu-item-about"}>
        <TouchableOpacity onPress={() => navigate("About", About, this.props)}>
          <View style={this._getMenuItemStyle(SideMenuActions.ABOUT_LINK)}>
            <Text
              style={[
                AppStyles.baseTextLargeLight,
                this._getMenuItemTextStyle(SideMenuActions.ABOUT_LINK)
              ]}
            >
              {"About"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );

    // show logout menu-item
    if (this.props.isLoggedIn) {
      menuItems.push(
        <View key={"menu-item-logout"}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("", "Are you sure you want to logout?", [
                {
                  text: "Cancel",
                  onPress: () => {
                    /* do nothing */
                  }
                },
                {
                  text: "Yes",
                  onPress: () => {
                    // remove profile and all entities
                    this.props.deleteProfile();
                    this.props.deleteAllTasks();

                    // logout requires ui update
                    navigate("All Tasks", MultiTaskPage);
                  }
                }
              ]);
            }}
          >
            <View style={[styles.menuItem]}>
              <Text style={[AppStyles.baseTextLargeLight, styles.menuItemText]}>
                {"Logout"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return menuItems;
  };

  _renderUserDetails = () => {
    let greeting = "";

    /*
    TODO - refine
    if (this.props.isLoggedIn && this.props.profile.name) {
      greeting = `Hello, ${this.props.profile.name}!`;
    }
    */

    // TODO - set streak info, points, etc

    return (
      <View style={[AppStyles.padding, styles.userGreeting]}>
        <Text style={[AppStyles.baseText, styles.userGreetingText]}>
          {greeting}
        </Text>
      </View>
    );
  };

  render = () => {
    const menuItems = this._constructMenuItems();

    // TODO - render a greeting
    /*
      {this._renderUserDetails()}

      <View style={[AppStyles.divider]}/>
    */

    return (
      <ScrollView
        scrollEnabled={false}
        automaticallyAdjustContentInsets={false}
        ref={"scrollView"}
        style={[AppStyles.container]}
        contentContainerStyle={[
          styles.containerCentered,
          styles.containerStretched
        ]}
      >
        <View style={[styles.menuContainer]}>
          <View style={[styles.menu]}>
            {menuItems}
          </View>
        </View>
      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  menuContainer: {
    left: 0,
    right: 0,
    backgroundColor: "black"
  },
  menu: {
    left: 0,
    right: 0,
    height: AppConfig.windowHeight,
    backgroundColor: AppConfig.sidebarBackgroundColor,
    paddingTop: 60 // padding at top so menuItems are closer to middle of screen
  },
  menuItem: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 16,
    paddingBottom: 16
  },
  menuItemHighlighted: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: AppConfig.selectedSidebarLinkColor
  },
  menuItemText: {
    color: "black"
  },
  menuItemTextHighlighted: {
    color: "black"
  },
  userGreetingText: {
    color: "white"
  },
  icon: {
    marginTop: 22,
    width: 26,
    height: 26
  }
});

const mapStateToProps = state => ({
  currentHighlightedLink: state.ui.sideMenu.currentHighlightedLink,
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile
  //isSyncing: state.sync.isSyncing,
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  closeSideMenu: SideMenuActions.closeSideMenu,
  deleteProfile: UserActions.deleteProfile,
  deleteAllTasks: TaskActions.deleteAllTasks
  //startSync: SyncActions.startSync,
  //stopSync: SyncActions.stopSync,
  //sync: SyncActions.sync
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
