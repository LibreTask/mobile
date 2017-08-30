/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";

import * as SideMenuActions from "../../actions/ui/sidemenu";
import * as UserController from "../../models/controllers/user";
import * as UserActions from "../../actions/entities/user";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

import Validator from "validator";

import MultiTaskPage from "./MultiTaskPage";

class Signup extends Component {
  static componentName = "Signup";

  constructor(props) {
    super(props);

    this.state = {
      isSigningUp: false,
      signupError: "",
      email: "",
      password: "",
      confirmPassword: "",
      emailValidationError: "",
      passwordValidationError: "",
      confirmPasswordValidationError: ""
    };
  }

  componentWillMount = () => {
    this.props.updateHighlight(SideMenuActions.PROFILE_LINK);
  };

  _signup = async () => {
    if (this.state.isSigningUp) {
      return;
    }

    let email = this.state.email || "";
    let password = this.state.password || "";
    let confirmPassword = this.state.confirmPassword || "";

    let emailValidationError = "";
    let passwordValidationError = "";
    let confirmPasswordValidationError: "";

    if (!Validator.isEmail(email)) {
      emailValidationError = "Email is not valid";
    }

    if (!Validator.isLength(password, { min: 6, max: 100 })) {
      passwordValidationError = "Password must be between 6 and 100 characters";
    }

    // only check whether password equals confirm password, if password is valid
    if (!passwordValidationError && password !== confirmPassword) {
      confirmPasswordValidationError = "Passwords do not match";
    }

    if (
      passwordValidationError ||
      emailValidationError ||
      confirmPasswordValidationError
    ) {
      this.setState({
        signupError: "",
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError,
        confirmPasswordValidationError: confirmPasswordValidationError
      });

      return; // validation failed; cannot signup
    }

    // TODO - display a spinner during signup
    this.setState(
      {
        isSigningUp: true,
        signupError: "",
        emailValidationError: "",
        passwordValidationError: "",
        confirmPasswordValidationError: ""
      },
      () => {
        UserController.signup(email, password)
          .then(response => {
            let profile = response.profile;

            // TODO - handle PW in more secure way
            profile.password = password;

            // preserve any of the offline-configured profile preferences
            profile.showCompletedTasks =
              this.props.profile && this.props.profile.showCompletedTasks;

            this.props.createOrUpdateProfile(profile);

            this.props.navigator.replace({
              title: "Main",
              component: MultiTaskPage,
              index: 0
            });
          })
          .catch(error => {
            this.setState({
              signupError: error.message,
              isSigningUp: false
            });
          });
      }
    );
  };

  _constructNavbar = () => {
    let title = "Signup";
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
            keyboardType="email-address"
            style={[AppStyles.baseTextLight]}
            onChangeText={updatedEmail => {
              this.setState({ email: updatedEmail });
            }}
            value={this.state.email}
          />

          <Text style={[AppStyles.errorText]}>
            {this.state.emailValidationError}
          </Text>
        </View>

        <View style={[AppStyles.paddingVertical]}>
          <Text style={[AppStyles.baseText]}>Password</Text>
          <TextInput
            secureTextEntry={true}
            style={[AppStyles.baseTextLight]}
            onChangeText={updatedPassword => {
              this.setState({ password: updatedPassword });
            }}
            value={this.state.password}
          />

          <Text style={[AppStyles.errorText]}>
            {this.state.passwordValidationError}
          </Text>
        </View>

        <View style={[AppStyles.paddingVertical]}>
          <Text style={[AppStyles.baseText]}>Confirm Password</Text>
          <TextInput
            secureTextEntry={true}
            style={[AppStyles.baseTextLight]}
            onChangeText={updatedConfirmPassword => {
              this.setState({ confirmPassword: updatedConfirmPassword });
            }}
            value={this.state.confirmPassword}
          />

          <Text style={[AppStyles.errorText]}>
            {this.state.confirmPasswordValidationError}
          </Text>
        </View>

        <View style={[AppStyles.button]}>
          <Button title={"Signup"} onPress={this._signup} />
        </View>

        <Text style={[AppStyles.baseTextSmall, AppStyles.errorText]}>
          {this.state.signupError}
        </Text>
      </View>
    );
  };

  render = () => {
    let content;

    if (this.state.isSigningUp) {
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
        ref={"scrollView"}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}
      >
        {this._constructNavbar()}
        {content}
      </ScrollView>
    );
  };
}

const mapStateToProps = state => ({
  profile: state.entities.user.profile
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  updateHighlight: SideMenuActions.updateHighlight
};

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
