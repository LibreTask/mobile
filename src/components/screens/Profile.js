/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView
} from "react-native";
import { connect } from "react-redux";

import * as SideMenuActions from "../../actions/ui/sidemenu";
import * as UserActions from "../../actions/entities/user";
import * as UserController from "../../models/controllers/user";
import * as TaskActions from "../../actions/entities/task";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

import moment from "moment";

import Validator from "validator";

import MultiTaskPage from "./MultiTaskPage";

class Profile extends Component {
  static componentName = "Profile";

  constructor(props) {
    super(props);

    this.state = {
      isUpdatingProfile: false,
      updateError: "",
      updateSuccess: "",
      emailValidationError: "",
      myProfile: this.props.user.profile
    };
  }

  componentWillMount = () => {
    this.props.updateHighlight(SideMenuActions.PROFILE_LINK);
  };

  componentWillReceiveProps = nextProps => {
    /* TODO -
    should we keep a copy in memory and ONLY update it with a refresh button?

    we want to avoid having the page update by itself, overriding any user
    actions in progress.
    */
    // another device could have updated profile attributes
    //this.setState({ nextProps: nextProps.user.profile });
  };

  _onDelete = () => {
    if (this.state.isUpdatingProfile) {
      return;
    }

    Alert.alert("", "Are you sure you want to delete your account?", [
      {
        text: "Close",
        onPress: () => {
          /* do nothing */
        }
      },
      {
        text: "Yes",
        onPress: async () => {
          this.setState(
            {
              isUpdatingProfile: true,
              updateError: "",
              updateSuccess: "",
              emailValidationError: ""
            },
            () => {
              UserController.deleteProfile(this.state.myProfile)
                .then(response => {
                  this.props.deleteProfile();
                  this.props.deleteAllTasks();

                  // profile deletion ui update
                  this.props.navigator.replace({
                    title: "Main",
                    component: MultiTaskPage,
                    index: 0
                  });
                })
                .catch(error => {
                  this.setState({
                    updateError: error.message,
                    isUpdatingProfile: false
                  });
                });
            }
          );
        }
      }
    ]);
  };

  _onSubmitEdit = async () => {
    if (this.state.isUpdatingProfile) {
      return;
    }

    let updatedEmail = this.state.myProfile.email || "";

    let emailValidationError = "";

    if (!Validator.isEmail(updatedEmail)) {
      emailValidationError = "Email is not valid";
    }

    if (emailValidationError) {
      this.setState({
        updateError: "",
        updateSuccess: "",
        emailValidationError: emailValidationError
      });

      return; // validation failed; cannot updated profile
    }

    this.setState({
      isUpdatingProfile: true,
      updateSuccess: "",
      updateError: "",
      emailValidationError: ""
    });

    UserController.updateProfile(this.state.myProfile)
      .then(response => {
        // TODO - handle password better
        response.profile.password = this.props.user.profile.password;

        this.props.createOrUpdateProfile(response.profile);

        this.setState({
          updateSuccess: "Update successful!",
          isUpdated: false,
          isUpdatingProfile: false
        });

        setTimeout(() => {
          this.setState({ updateSuccess: "" });
        }, 1500); // remove message after 1.5 seconds
      })
      .catch(error => {
        this.setState({
          isUpdatingProfile: false,
          updateError: error.message,
          updateSuccess: ""
        });
      });
  };

  _constructNavbar = () => {
    let title = "Profile";
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.toggleSideMenu();
        }}
        icon={"bars"}
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

  _activityIndactor = () => {
    return (
      <ActivityIndicator
        style={[AppStyles.progressSpinner]}
        color="blue"
        size="large"
      />
    );
  };

  _viewContent = windowOpacity => {
    return (
      <View style={[AppStyles.padding, { opacity: windowOpacity }]}>
        <View style={[AppStyles.paddingVertical]}>
          <Text style={[AppStyles.baseText]}>Email</Text>
          <TextInput
            style={[AppStyles.baseTextLight]}
            onChangeText={updatedEmail => {
              let profile = this.state.myProfile;
              profile.email = updatedEmail;
              this.setState({ myProfile: profile });
            }}
            value={this.state.myProfile.email}
          />
          <Text style={[AppStyles.errorText]}>
            {this.state.emailValidationError}
          </Text>
        </View>

        <View style={[AppStyles.row]}>
          <View style={[AppStyles.button]}>
            <Button
              title="Save"
              onPress={() => {
                this._onSubmitEdit();
              }}
            />
          </View>
        </View>
        <View style={[AppStyles.row]}>
          <View style={[AppStyles.button]}>
            <Button
              title="Delete"
              onPress={() => {
                this._onDelete();
              }}
            />
          </View>
        </View>

        <Text style={[AppStyles.successText]}>
          {this.state.updateSuccess}
        </Text>

        <Text style={[AppStyles.errorText]}>
          {this.state.updateError}
        </Text>
      </View>
    );
  };

  render = () => {
    let content;

    if (this.state.isUpdatingProfile) {
      let windowOpacity = AppConfig.loadingOpacity;
      content = (
        <View>
          {this._activityIndactor()}
          {this._viewContent(windowOpacity)}
        </View>
      );
    } else {
      let windowOpacity = 1;
      content = (
        <View>
          {this._viewContent(windowOpacity)}
        </View>
      );
    }

    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}
      >
        {this._constructNavbar()}
        {content}
      </ScrollView>
    );
  };
}

const mapStateToProps = state => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  user: state.entities.user
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  updateHighlight: SideMenuActions.updateHighlight,
  deleteAllTasks: TaskActions.deleteAllTasks
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
