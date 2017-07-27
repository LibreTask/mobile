/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import {
  Button,
  Linking,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { connect } from "react-redux";

import * as SideMenuActions from "../../actions/ui/sidemenu";

import * as UserActions from "../../actions/entities/user";
import * as UserController from "../../models/controllers/user";
import * as ProfileStorage from "../../models/storage/profile-storage";

import CheckBox from "react-native-checkbox";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

class Settings extends Component {
  static componentName = "Settings";

  constructor(props) {
    super(props);

    this.state = {
      showCompletedTasks: props.profile && props.profile.showCompletedTasks
    };
  }

  _updateProfileLocally = (profile, shouldQueueUpdate) => {
    if (shouldQueueUpdate) {
      // mark update time, before queueing
      profile.updatedAtDateTimeUtc = new Date();

      // profile is queued only when network could not be reached
      this.props.addPendingProfileUpdate(profile);
      ProfileStorage.queueProfileUpdate(profile);
    }

    this.props.createOrUpdateProfile(profile);
    ProfileStorage.createOrUpdateProfile(profile);

    this.setState({
      showCompletedTasks: profile.showCompletedTasks
    });
  };

  _constructNavbar = () => {
    let title = "Settings";
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.navigator.pop();
        }}
        icon={"arrow-left"}
      />
    );

    return (
      <View style={[AppStyles.navbarContainer]}>
        <NavigationBar
          title={<NavbarTitle title={title || null} />}
          statusBar={{ style: "light-content", hidden: false }}
          style={[AppStyles.navbar]}
          tintColor={AppConfig.primaryColor}
          leftButton={leftNavBarButton}
        />
      </View>
    );
  };

  render = () => {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}
      >
        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>
          <CheckBox
            labelStyle={AppStyles.baseTextLight}
            label={"Show completed tasks"}
            checked={this.state.showCompletedTasks}
            onChange={checked => {
              let updatedProfile = this.props.profile;
              updatedProfile.showCompletedTasks = !updatedProfile.showCompletedTasks;

              if (UserController.canAccessNetwork(updatedProfile)) {
                UserController.updateProfile(updatedProfile)
                  .then(response => {
                    let profile = response.profile;

                    // TODO - handle PW in more secure way
                    profile.password = this.props.profile.password;

                    this._updateProfileLocally(profile);
                  })
                  .catch(error => {
                    let shouldQueueUpdate = true;
                    this._updateProfileLocally(
                      updatedProfile,
                      shouldQueueUpdate
                    );
                  });
              } else {
                let shouldQueueUpdate = true;
                this._updateProfileLocally(updatedProfile, shouldQueueUpdate);
              }
            }}
          />
        </View>
      </ScrollView>
    );
  };
}

const mapStateToProps = state => ({
  profile: state.entities.user.profile
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  addPendingProfileUpdate: UserActions.addPendingProfileUpdate
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
